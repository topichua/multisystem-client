import type { CatalogSearchProductGroup } from "@/features/orders/model/orders-store";
import { getCatalogVariantImageUrl } from "@/features/products/utils/catalog-variant-display";

export type GroupedSearchProduct = {
  categoryName: string | null;
  imageUrl: string | null;
  productKey: string;
  productName: string;
  selectedCount: number;
  variants: CatalogSearchProductGroup["variants"];
};

export function buildGroupedSearchProducts({
  catalogSearchProductGroups,
  categoryLabelById,
  selectedVariantIds,
}: {
  catalogSearchProductGroups: CatalogSearchProductGroup[];
  categoryLabelById: Map<number, string>;
  selectedVariantIds: Set<number>;
}): GroupedSearchProduct[] {
  return catalogSearchProductGroups
    .map((group, index) => {
      const productId = group.product.id;
      const productKey = String(productId ?? `${group.product.name}-${index}`);
      const categoryName =
        group.product.categoryId == null
          ? null
          : (categoryLabelById.get(group.product.categoryId) ?? null);

      return {
        categoryName,
        imageUrl:
          group.variants
            .map((variant) => getCatalogVariantImageUrl(variant))
            .find(Boolean) ?? null,
        productKey,
        productName: group.product.name,
        selectedCount: group.variants.filter((variant) =>
          selectedVariantIds.has(variant.id),
        ).length,
        variants: group.variants,
      };
    })
    .filter((group) => group.variants.length > 0);
}
