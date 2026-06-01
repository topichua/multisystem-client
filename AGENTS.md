# Repository Guidelines

## Project Overview

Lantoro is a React 19, TypeScript, Vite application. The UI stack is Ant Design, styled-components, Phosphor icons, MobX, React Router, and i18next.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs `tsc -b`.
- `npm run build` runs typecheck and creates the Vite build.
- `npm run format:check` checks Prettier formatting.
- `npm run format` writes Prettier formatting.

## Architecture

Keep the existing layered direction:

```txt
app -> pages -> features -> shared
```

- `src/app` contains application composition and routing.
- `src/pages` contains route-level screens and page-local UI.
- `src/features` contains domain APIs, models, and feature UI.
- `src/shared` is reserved for feature-agnostic infrastructure and reusable UI.
- Do not import from `features`, `pages`, or `app` inside `shared`.

## Imports

- Use the `@/*` root alias for cross-layer imports.
- Use relative imports for colocated files in the same feature/page area.
- Avoid `../../` imports between top-level layers.
- SVG imports are supported through `vite-plugin-svgr`.

## Coding Notes

- TypeScript is configured with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`; prefer type-only imports where appropriate.
- Follow existing page patterns: split larger page flows into `controllers`, `form`, `list`, `pages`, `sections`, and local `*.styled.tsx` files when that pattern already exists.
- Prefer Ant Design controls and existing layout components before introducing custom primitives.
- Use `@phosphor-icons/react` for icons unless the surrounding code already uses a local SVG.
- Keep user-facing strings aligned with the existing i18n setup in `src/i18n/locales`.

## Working Tree

The worktree may contain user edits. Before changing files, check `git status --short` and preserve unrelated modifications.
