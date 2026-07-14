import type { CatalogVariant } from "@/features/products/model/product.types";

export function isZeroStockCatalogVariant(variant: CatalogVariant): boolean {
  return variant.quantity <= 0 || variant.inStock === false;
}
