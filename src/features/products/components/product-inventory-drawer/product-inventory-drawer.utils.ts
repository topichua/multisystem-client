import type {
  ProductInventoryVariant,
  ProductVariant,
} from "@/features/products/model/product.types";
import { getVariantTitle } from "@/features/products/utils/product-display";

export function formatNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString();
}

export function getVariantQuantity(variant: ProductInventoryVariant): number {
  return Number(variant.quantity ?? 0);
}

export function getMarginPercent(
  price: number | null | undefined,
  purchasePrice: number | null | undefined,
): number | null {
  if (price == null || purchasePrice == null || purchasePrice <= 0) {
    return null;
  }

  return Math.round(((price - purchasePrice) / purchasePrice) * 100);
}

export function getVariantDisplayName(
  inventoryVariant: ProductInventoryVariant,
  detailVariant: ProductVariant | undefined,
  fallback: string,
): string {
  const name = inventoryVariant.name?.trim();
  if (name) {
    return name;
  }

  const detailName = detailVariant ? getVariantTitle(detailVariant) : "";
  return detailName || fallback;
}
