import { isUncategorizedCategory } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";

export const countCategoryTreeItems = (categories: Category[]): number =>
  categories.reduce(
    (sum, category) => sum + (isUncategorizedCategory(category) ? 0 : 1),
    0,
  );

export const countCategoryTreeProducts = (categories: Category[]): number =>
  categories.reduce(
    (sum, category) =>
      sum + (isUncategorizedCategory(category) ? 0 : category.productCount),
    0,
  );

export const filterCategoryTreeBySearch = (
  categories: Category[],
  searchValue: string,
): Category[] => {
  const normalizedSearch = searchValue.trim().toLowerCase();

  if (!normalizedSearch) {
    return categories;
  }

  return categories.flatMap((category) =>
    filterCategoryTreeNode(category, normalizedSearch),
  );
};

const filterCategoryTreeNode = (
  category: Category,
  normalizedSearch: string,
): Category[] => {
  if (category.name.toLowerCase().includes(normalizedSearch)) {
    return [category];
  }

  const children = category.children.flatMap((child) =>
    filterCategoryTreeNode(child, normalizedSearch),
  );

  if (children.length === 0) {
    return [];
  }

  return [{ ...category, children }];
};

export const excludeCategoryBranchById = (
  categories: Category[],
  excludedCategoryId: number,
): Category[] =>
  categories.flatMap((category) => {
    if (category.id === excludedCategoryId) {
      return [];
    }

    return [
      {
        ...category,
        children: excludeCategoryBranchById(
          category.children,
          excludedCategoryId,
        ),
      },
    ];
  });

export const hasCategoryUsage = (category: Category): boolean =>
  category.productCount > 0 || category.productVariantCount > 0;

export const getExpandableCategoryKeys = (categories: Category[]): string[] =>
  categories.flatMap((category) => {
    if (category.children.length === 0) {
      return [];
    }

    return [
      String(category.id),
      ...getExpandableCategoryKeys(category.children),
    ];
  });
