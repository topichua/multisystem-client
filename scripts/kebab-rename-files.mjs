#!/usr/bin/env node
/**
 * Renames all src .ts/.tsx basenames to kebab-case; updates @/ and relative imports.
 * Run from repo root: node scripts/kebab-rename-files.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

function toKebabSegment(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function kebabBasename(fullBasename) {
  const m = fullBasename.match(/^(.+)(\.styled\.tsx)$/);
  if (m) return `${toKebabSegment(m[1])}.styled.tsx`;
  const m2 = fullBasename.match(/^(.+)(\.types\.ts)$/);
  if (m2) return `${toKebabSegment(m2[1])}.types.ts`;
  if (fullBasename.endsWith(".tsx"))
    return `${toKebabSegment(fullBasename.slice(0, -4))}.tsx`;
  if (fullBasename.endsWith(".ts"))
    return `${toKebabSegment(fullBasename.slice(0, -3))}.ts`;
  return fullBasename;
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function moduleIdFromSrc(absPath) {
  const rel = path.relative(SRC, absPath).replace(/\\/g, "/");
  return rel.replace(/\.tsx?$/, "");
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectPatchFiles(dir, acc) {
  if (!fs.existsSync(dir)) return;
  const st = fs.statSync(dir);
  if (st.isFile()) {
    if (/\.(tsx?|mts|cts|json|html|css|md|svg)$/.test(dir)) acc.push(dir);
    return;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      ent.name === "node_modules" ||
      ent.name === ".git" ||
      ent.name === "dist"
    )
      continue;
    collectPatchFiles(path.join(dir, ent.name), acc);
  }
}

const files = walk(SRC);
const renames = [];

for (const abs of files) {
  const base = path.basename(abs);
  const nextBase = kebabBasename(base);
  if (base === nextBase) continue;
  const dir = path.dirname(abs);
  const nextAbs = path.join(dir, nextBase);
  const caseOnlyRename =
    path.basename(abs).toLowerCase() === nextBase.toLowerCase() &&
    path.basename(abs) !== nextBase;
  if (!caseOnlyRename && fs.existsSync(nextAbs)) {
    console.error(`Collision: ${nextAbs} already exists (from ${abs})`);
    process.exit(1);
  }
  renames.push({
    oldAbs: abs,
    newAbs: nextAbs,
    fromMod: moduleIdFromSrc(abs),
    toMod: moduleIdFromSrc(nextAbs),
    caseOnlyRename,
  });
}

renames.sort((a, b) => b.fromMod.length - a.fromMod.length);

console.error(`Renaming ${renames.length} files...`);

for (const { oldAbs, newAbs, caseOnlyRename } of renames) {
  fs.mkdirSync(path.dirname(newAbs), { recursive: true });
  if (caseOnlyRename) {
    const tmp = path.join(
      path.dirname(oldAbs),
      `__kebab_tmp__${path.basename(oldAbs)}`,
    );
    execSync(`git mv "${oldAbs}" "${tmp}"`, { cwd: ROOT, stdio: "inherit" });
    execSync(`git mv "${tmp}" "${newAbs}"`, { cwd: ROOT, stdio: "inherit" });
  } else {
    execSync(`git mv "${oldAbs}" "${newAbs}"`, { cwd: ROOT, stdio: "inherit" });
  }
}

const stems = renames.map(({ oldAbs, newAbs }) => ({
  oldStem: path.basename(oldAbs).replace(/\.tsx?$/, ""),
  newStem: path.basename(newAbs).replace(/\.tsx?$/, ""),
}));
stems.sort((a, b) => b.oldStem.length - a.oldStem.length);

const patchFiles = [];
collectPatchFiles(SRC, patchFiles);
for (const f of ["vite.config.ts", "eslint.config.js", "index.html"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) patchFiles.push(p);
}

for (const file of patchFiles) {
  let content = fs.readFileSync(file, "utf8");

  for (const { fromMod, toMod } of renames) {
    if (fromMod === toMod) continue;
    content = content.replaceAll(`@/${fromMod}`, `@/${toMod}`);
    content = content.replaceAll(`@/${fromMod}.ts`, `@/${toMod}.ts`);
    content = content.replaceAll(`@/${fromMod}.tsx`, `@/${toMod}.tsx`);
    content = content.replaceAll(`/src/${fromMod}`, `/src/${toMod}`);
    content = content.replaceAll(`'/src/${fromMod}'`, `'/src/${toMod}'`);
    content = content.replaceAll(`"/src/${fromMod}"`, `"/src/${toMod}"`);
  }

  for (const { oldStem, newStem } of stems) {
    if (oldStem === newStem) continue;
    const e = escapeRe(oldStem);
    /** `./router/PageRoutes` → prefix `./router/`, stem last segment */
    const relPrefix = `(?:\\./|(?:\\.\\./)+)(?:[\\w.-]+\\/)*`;
    const fromRel = new RegExp(`(from\\s+)(['"])(${relPrefix})${e}\\2`, "g");
    content = content.replace(
      fromRel,
      (_, kw, q, prefix) => `${kw}${q}${prefix}${newStem}${q}`,
    );
    const impRel = new RegExp(
      `(import\\s*\\(\\s*)(['"])(${relPrefix})${e}\\2(\\s*\\))`,
      "g",
    );
    content = content.replace(
      impRel,
      (_, a, q, prefix, tail) => `${a}${q}${prefix}${newStem}${q}${tail}`,
    );
    const expRel = new RegExp(
      `(export\\s+\\*\\s+from\\s+)(['"])(${relPrefix})${e}\\2`,
      "g",
    );
    content = content.replace(
      expRel,
      (_, kw, q, prefix) => `${kw}${q}${prefix}${newStem}${q}`,
    );
    const expNamed = new RegExp(
      `(export\\s+(?:type\\s+)?\\{[^}]*\\}\\s+from\\s+)(['"])(${relPrefix})${e}\\2`,
      "g",
    );
    content = content.replace(
      expNamed,
      (_, kw, q, prefix) => `${kw}${q}${prefix}${newStem}${q}`,
    );
  }

  fs.writeFileSync(file, content);
}

console.error("Done.");
