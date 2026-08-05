import type {
  StockSupplyLineItem,
  StockSupplyListItem,
} from "@/features/inventory/model/inventory.types";
import { productsApi } from "@/features/products/api/products-api";
import type {
  CatalogVariant,
  CatalogVariantsListResponse,
} from "@/features/products/model/product.types";
import { formatCatalogVariantCurrency } from "@/features/products/utils/catalog-variant-display";

import type { SupplyLine, VariantGroup } from "./stock-supply-modal.types";

export const STOCK_SUPPLY_VARIANTS_PAGE_SIZE = 100;
export const STOCK_SUPPLY_SEARCH_DEBOUNCE_MS = 300;

export async function fetchCatalogVariantsPage(params: {
  keyword?: string;
  categoryIds?: number[];
  page: number;
  pageSize?: number;
}): Promise<CatalogVariantsListResponse> {
  return productsApi.listProductVariants({
    keyword: params.keyword?.trim() ?? "",
    categoryIds: params.categoryIds,
    page: params.page,
    pageSize: params.pageSize ?? STOCK_SUPPLY_VARIANTS_PAGE_SIZE,
  });
}

export function mergeCatalogVariants(
  current: CatalogVariant[],
  incoming: CatalogVariant[],
): CatalogVariant[] {
  if (incoming.length === 0) {
    return current;
  }

  const seen = new Set(current.map((variant) => variant.id));
  const next = [...current];

  for (const variant of incoming) {
    if (seen.has(variant.id)) {
      continue;
    }
    seen.add(variant.id);
    next.push(variant);
  }

  return next;
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

export function formatAmount(
  value: number,
  currency: string | null | undefined,
) {
  return `${value.toLocaleString("uk-UA")} ${formatCatalogVariantCurrency(currency)}`.trim();
}

export function groupVariantsByProduct(
  variants: CatalogVariant[],
): VariantGroup[] {
  const groups: VariantGroup[] = [];
  const groupByProductId = new Map<number, VariantGroup>();

  for (const variant of variants) {
    const existing = groupByProductId.get(variant.productId);
    if (existing) {
      existing.variants.push(variant);
      continue;
    }

    const group: VariantGroup = {
      key: String(variant.productId),
      productName: variant.product.name,
      variants: [variant],
    };
    groupByProductId.set(variant.productId, group);
    groups.push(group);
  }

  return groups;
}

const createFallbackCatalogVariant = (
  item: StockSupplyLineItem,
): CatalogVariant => ({
  id: item.productVariantId,
  productId: item.productId,
  color: null,
  size: null,
  sku: item.sku ?? null,
  unitPrice: item.buyPrice,
  imageUrl: null,
  inStock: false,
  quantity: 0,
  wishlistCount: 0,
  status: "active",
  label: item.variantName?.trim() || `#${item.productVariantId}`,
  product: {
    id: item.productId,
    name: item.productName?.trim() || `#${item.productId}`,
    categoryId: null,
    mainImageUrl: null,
    currency: "UAH",
    status: "active",
    price: item.buyPrice,
  },
});

export function buildSupplyLines(
  supply: StockSupplyListItem,
  variants: CatalogVariant[] = [],
): SupplyLine[] {
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  return supply.items.map((item) => {
    const variant =
      variantById.get(item.productVariantId) ??
      createFallbackCatalogVariant(item);

    return {
      variant,
      quantity: item.quantity,
      buyPrice: item.buyPrice,
    };
  });
}
