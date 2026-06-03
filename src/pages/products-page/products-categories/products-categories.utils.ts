import type { Category } from "@/features/categories/model/category.types";

export const sortCategoriesByName = <T extends Pick<Category, "name">>(
  categories: T[],
): T[] =>
  [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

export const getRootCategories = (categories: Category[]): Category[] =>
  sortCategoriesByName(
    categories.filter((category) => category.parentId == null),
  );

export const resolveNextCategoryIdAfterDelete = (
  categories: Category[],
  deletedCategoryId: number,
): number | null => {
  const sortedCategories = getRootCategories(categories);
  const deletedIndex = sortedCategories.findIndex(
    (category) => category.id === deletedCategoryId,
  );

  if (deletedIndex < 0) {
    return (
      sortedCategories.find((category) => category.id !== deletedCategoryId)
        ?.id ?? null
    );
  }

  const nextCategory =
    sortedCategories[deletedIndex + 1] ?? sortedCategories[deletedIndex - 1];

  return nextCategory?.id ?? null;
};
