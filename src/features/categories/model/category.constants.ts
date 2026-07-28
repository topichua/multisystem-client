import type { Category } from "@/features/categories/model/category.types";

export const UNCATEGORIZED_CATEGORY_ID = -1;

export const isUncategorizedCategory = (
  category: Pick<Category, "id">,
): boolean => category.id === UNCATEGORIZED_CATEGORY_ID;
