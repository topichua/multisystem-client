import { productsApi } from "@/features/products/api/products-api";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { formatCatalogVariantCurrency } from "@/features/products/utils/catalog-variant-display";

import type { VariantGroup } from "./stock-supply-modal.types";

const VARIANTS_PAGE_SIZE = 100;

export async function loadAllCatalogVariants(): Promise<CatalogVariant[]> {
  const variants: CatalogVariant[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (variants.length < total) {
    const result = await productsApi.listProductVariants({
      keyword: "",
      page,
      pageSize: VARIANTS_PAGE_SIZE,
    });

    variants.push(...result.items);
    total = result.total;

    if (result.items.length === 0 || variants.length >= total) {
      break;
    }

    page += 1;
  }

  const seenVariantIds = new Set<number>();
  return variants.filter((variant) => {
    if (seenVariantIds.has(variant.id)) {
      return false;
    }

    seenVariantIds.add(variant.id);
    return true;
  });
}

export function toNumber(value: string | number | null): number | null {
  if (value == null || value === "") {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function getVariantMeta(variant: CatalogVariant): string {
  return [variant.color, variant.size, variant.sku].filter(Boolean).join(" / ");
}

export function getVariantSearchText(variant: CatalogVariant): string {
  return [
    variant.product.name,
    variant.label,
    variant.color,
    variant.size,
    variant.sku,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function formatAmount(
  value: number,
  currency: string | null | undefined,
) {
  return `${value.toLocaleString("uk-UA")} ${formatCatalogVariantCurrency(currency)}`.trim();
}

export function groupVariantsByProduct(
  variants: CatalogVariant[],
): VariantGroup[] {
  const groupByProductId = new Map<number, VariantGroup>();

  for (const variant of variants) {
    const existing = groupByProductId.get(variant.productId);

    if (existing) {
      existing.variants.push(variant);
      continue;
    }

    groupByProductId.set(variant.productId, {
      key: String(variant.productId),
      productName: variant.product.name,
      variants: [variant],
    });
  }

  return [...groupByProductId.values()];
}
