import type { CatalogSearchMode } from "@/features/orders/model/orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";

export type VariantSelectOptionData = {
  variant: CatalogVariant;
};

export type VariantSelectOption = {
  label: string;
  value: number;
  variant: CatalogVariant;
};

export type UseCatalogProductSearchOptions = {
  debounceMs?: number;
  defaultCategoryId?: number | null;
  defaultMode?: CatalogSearchMode;
  enabled?: boolean;
  loadCategories?: boolean;
  minSearchLength?: number;
};
