import type { Category } from "@/features/categories/model/category.types";

import type { CategorySelectOptionData } from "./catalog-product-search.types";

export const flattenCategoriesForSelect = (
  categories: Category[],
  level = 0,
): CategorySelectOptionData[] =>
  categories.flatMap((category) => [
    { value: category.id, label: category.name, level },
    ...flattenCategoriesForSelect(category.children ?? [], level + 1),
  ]);
