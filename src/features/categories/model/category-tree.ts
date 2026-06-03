import type { TreeDataNode } from "antd";

import type { Category } from "@/features/categories/model/category.types";

export const countCategoryDescendants = (category: Category): number =>
  (category.children ?? []).reduce(
    (sum, child) => sum + 1 + countCategoryDescendants(child),
    0,
  );

export const flattenCategories = (roots: Category[]): Category[] => {
  const out: Category[] = [];

  const walk = (nodes: Category[]): void => {
    for (const node of nodes) {
      out.push(node);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };

  walk(roots);
  return out;
};

export const findCategoryById = (
  roots: Category[],
  id: number,
): Category | undefined => {
  for (const node of roots) {
    if (node.id === id) {
      return node;
    }
    if (node.children?.length) {
      const found = findCategoryById(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
};

export const findAncestorIds = (
  roots: Category[],
  targetId: number,
): number[] => {
  const result: number[] = [];

  const walk = (nodes: Category[], stack: number[]): boolean => {
    for (const node of nodes) {
      if (node.id === targetId) {
        result.push(...stack);
        return true;
      }
      if (node.children?.length) {
        if (walk(node.children, [...stack, node.id])) {
          return true;
        }
      }
    }

    return false;
  };

  walk(roots, []);
  return result;
};

export const categoriesEligibleAsParent = (
  roots: Category[],
  excludeCategoryId?: number,
): Category[] =>
  flattenCategories(roots)
    .filter((category) => category.parentId === null)
    .filter(
      (category) =>
        excludeCategoryId == null || category.id !== excludeCategoryId,
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

export const categoriesToTreeData = (roots: Category[]): TreeDataNode[] =>
  [...roots]
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    )
    .map((node) => ({
      title: node.name,
      key: String(node.id),
      children: node.children?.length
        ? categoriesToTreeData(node.children)
        : undefined,
    }));
