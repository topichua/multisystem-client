import type {
  CatalogVariant,
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";
import {
  getVariantTitle,
  resolveProductImageSrc,
} from "@/features/products/utils/product-display";

function getVariantCustomFieldValue(
  variant: ProductVariant,
  key: string,
): string | null {
  const field = variant.customFields.find((item) => item.key === key);
  return field?.value?.trim() || null;
}

export function getVariantDescriptor(variant: ProductVariant): string {
  const customFieldTitle = getVariantTitle(variant);
  const parts = [customFieldTitle, variant.sku]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(parts)].join(" / ");
}

export function buildCatalogVariantLabel(
  productName: string,
  descriptor: string,
): string {
  return descriptor ? `${productName} · ${descriptor}` : productName;
}

export function buildCatalogVariantLabelFromVariant(
  productName: string,
  variant: ProductVariant,
): string {
  return buildCatalogVariantLabel(productName, getVariantDescriptor(variant));
}

export function buildCatalogVariantLabelFromParts(
  productName: string,
  parts: {
    color?: string | null;
    size?: string | null;
    sku?: string | null;
  },
): string {
  const descriptor = [parts.color, parts.size, parts.sku]
    .filter(Boolean)
    .join(" / ");

  return buildCatalogVariantLabel(productName, descriptor);
}

export function productVariantToCatalogVariant(
  product: Product,
  variant: ProductVariant,
): CatalogVariant {
  const unitPrice = variant.price ?? product.price ?? 0;
  const quantity = variant.quantity ?? product.quantity ?? 0;
  const inStock = variant.inStock ?? product.inStock ?? quantity > 0;

  return {
    id: variant.id,
    productId: product.id,
    color: getVariantCustomFieldValue(variant, "color"),
    size: getVariantCustomFieldValue(variant, "size"),
    sku: variant.sku ?? null,
    unitPrice,
    imageUrl: variant.imageUrl,
    inStock,
    quantity,
    wishlistCount: variant.wishlistCount ?? 0,
    status: variant.status ?? product.status,
    label: buildCatalogVariantLabelFromVariant(product.name, variant),
    customFields: variant.customFields ?? [],
    product: {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      mainImageUrl: product.mainImageUrl,
      currency: product.currency,
      status: product.status,
      price: unitPrice,
    },
  };
}

export function productToCatalogVariants(product: Product): CatalogVariant[] {
  return (product.variants ?? []).map((variant) =>
    productVariantToCatalogVariant(product, variant),
  );
}

export function getCatalogVariantImageUrl(
  variant: CatalogVariant,
): string | null {
  return variant.imageUrl ?? variant.product.mainImageUrl ?? null;
}

export function resolveCatalogVariantImageSrc(variant: CatalogVariant): string {
  return resolveProductImageSrc(getCatalogVariantImageUrl(variant));
}

function formatCatalogVariantCustomFieldMeta(field: {
  label?: string | null;
  value?: string | null;
}): string | null {
  const value = field.value?.trim();
  if (!value) {
    return null;
  }

  const label = field.label?.trim();
  return label ? `${label} - ${value}` : value;
}

export function getCatalogVariantMeta(variant: CatalogVariant): string {
  const fromCustomFields = [...(variant.customFields ?? [])]
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .map(formatCatalogVariantCustomFieldMeta)
    .filter((part): part is string => Boolean(part));

  if (fromCustomFields.length > 0) {
    return fromCustomFields.join(" / ");
  }

  return [variant.color, variant.size].filter(Boolean).join(" / ");
}

export function getCatalogVariantUnitPrice(variant: CatalogVariant): number {
  if (Number.isFinite(variant.unitPrice)) {
    return variant.unitPrice;
  }

  const productPrice = variant.product.price;
  return typeof productPrice === "number" && Number.isFinite(productPrice)
    ? productPrice
    : 0;
}

export function formatCatalogVariantCurrency(
  currency: string | null | undefined,
): string {
  return currency === "UAH" ? "₴" : (currency ?? "");
}

export function formatCatalogVariantPrice(variant: CatalogVariant): string {
  const unitPrice = getCatalogVariantUnitPrice(variant);
  const currency = formatCatalogVariantCurrency(variant.product.currency);

  return `${unitPrice.toLocaleString("uk-UA")} ${currency}`.trim();
}
