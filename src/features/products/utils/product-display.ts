import type {
  ProductStatus,
  ProductVariant,
} from "@/features/products/model/product.types";

export type ProductStatusColor =
  | "default"
  | "processing"
  | "success"
  | "warning"
  | "error";

const PRODUCT_STATUS_COLORS: Record<string, ProductStatusColor> = {
  draft: "default",
  active: "success",
  archived: "warning",
};

export const productStatusToColor = (
  status: ProductStatus | null | undefined,
): ProductStatusColor => PRODUCT_STATUS_COLORS[status ?? ""] ?? "processing";

export const variantStatusToColor = productStatusToColor;

export const getVariantTitle = (variant: ProductVariant): string =>
  [...(variant.customFields ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((field) => field.value)
    .filter(Boolean)
    .join(" / ");

export const formatProductPrice = (
  price: number | null | undefined,
  currency: string | null | undefined,
  fallback = "—",
): string => {
  if (price == null) {
    return fallback;
  }

  return `${price.toLocaleString()} ${currency ?? ""}`.trim();
};
