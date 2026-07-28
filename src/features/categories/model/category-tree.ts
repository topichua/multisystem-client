import type { Category } from "@/features/categories/model/category.types";

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
