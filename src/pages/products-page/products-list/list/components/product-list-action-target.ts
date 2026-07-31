import type {
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";
import { getVariantTitle } from "@/features/products/utils/product-display";

export type ProductListActionTarget =
  | { type: "product"; product: Product }
  | { type: "variant"; product: Product; variant: ProductVariant };

export function getProductListActionTargetKey(
  target: ProductListActionTarget | null,
): string | null {
  if (target == null) {
    return null;
  }

  if (target.type === "product") {
    return `product:${target.product.id}`;
  }

  return `variant:${target.product.id}:${target.variant.id}`;
}

export function getProductListActionVariantMeta(
  target: ProductListActionTarget | null,
  fallbackVariantName: string,
): { title: string; sku: string } | null {
  if (target?.type !== "variant") {
    return null;
  }

  return {
    title:
      getVariantTitle(target.variant) ||
      `${fallbackVariantName} #${target.variant.id}`,
    sku: target.variant.sku?.trim() || "—",
  };
}

export function isProductListActionTargetLoading(
  target: ProductListActionTarget | null,
  productLoadingId: number | null,
  variantLoadingId: number | null,
): boolean {
  if (target == null) {
    return false;
  }

  if (target.type === "product") {
    return productLoadingId === target.product.id;
  }

  return variantLoadingId === target.variant.id;
}
