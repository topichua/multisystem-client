import type {
  ProductStatus,
  ProductVariant,
} from "@/features/products/model/product.types";

type ProductReferenceId = string | number;

type ProductVariantTitleSource = {
  customFields?: unknown[] | null;
};

type ProductLinkedVariant<TReferenceId extends ProductReferenceId> = {
  referenceId?: TReferenceId | null;
};

type ProductPriceVariant = {
  price?: number | null;
};

type ProductPriceSource = {
  variants?: ProductPriceVariant[] | null;
  price?: number | null;
  currency?: string | null;
};

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

export const getProductVariantTitle = (
  variant: ProductVariantTitleSource,
): string =>
  [...(variant.customFields ?? [])]
    .filter(
      (field): field is { value?: unknown; order?: unknown } =>
        typeof field === "object" && field !== null,
    )
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map((field) => (typeof field.value === "string" ? field.value : null))
    .filter(Boolean)
    .join(" / ");

export const getVariantTitle = (variant: ProductVariant): string =>
  getProductVariantTitle(variant);

export const getLinkedProductVariants = <
  TReferenceId extends ProductReferenceId,
  TVariant extends ProductLinkedVariant<TReferenceId>,
>(product: {
  variants?: TVariant[] | null;
}): TVariant[] =>
  (product.variants ?? []).filter((variant) => variant.referenceId != null);

export const getProductRowUnlinkReferenceId = <
  TReferenceId extends ProductReferenceId,
>(product: {
  variants?: ProductLinkedVariant<TReferenceId>[] | null;
  referenceId?: TReferenceId | null;
}): TReferenceId | null => {
  const linkedVariants = getLinkedProductVariants(product);

  if (linkedVariants.length === 1) {
    return linkedVariants[0].referenceId ?? null;
  }

  if (linkedVariants.length === 0 && product.referenceId != null) {
    return product.referenceId;
  }

  return null;
};

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

export const getProductPriceRange = (
  product: ProductPriceSource,
): string | null => {
  const hasVariants = (product.variants?.length ?? 0) > 0;

  if (hasVariants) {
    const variantPrices = (product.variants ?? [])
      .map((variant) => variant.price)
      .filter((price): price is number => typeof price === 'number');

    if (variantPrices.length === 0) {
      return null;
    }

    const minPrice = Math.min(...variantPrices);
    const maxPrice = Math.max(...variantPrices);
    const currency = product.currency ?? '';

    if (minPrice === maxPrice) {
      return formatProductPrice(minPrice, product.currency);
    }

    return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ${currency}`.trim();
  }

  return product.price != null
    ? formatProductPrice(product.price, product.currency)
    : null;
};
