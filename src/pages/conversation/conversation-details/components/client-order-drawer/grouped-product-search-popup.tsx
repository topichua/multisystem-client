import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { CatalogSearchProductGroup } from "@/features/orders/model/orders-store";
import { getCatalogVariantImageUrl } from "@/features/products/utils/catalog-variant-display";

import * as S from "./client-order-product-search.styled";
import { VariantSearchContent } from "./variant-search-content";

const keepProductSearchPopupOpen = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

type GroupedSearchProduct = {
  categoryName: string | null;
  imageUrl: string | null;
  productKey: string;
  productName: string;
  selectedCount: number;
  variants: CatalogSearchProductGroup["variants"];
};

type GroupedProductSearchPopupProps = {
  expandedProductKeys: Set<string>;
  groupedProducts: GroupedSearchProduct[];
  selectedVariantIds: Set<number>;
  onToggleProduct: (productKey: string) => void;
  onVariantSelect: (variantId: number) => void;
};

export function GroupedProductSearchPopup({
  expandedProductKeys,
  groupedProducts,
  selectedVariantIds,
  onToggleProduct,
  onVariantSelect,
}: GroupedProductSearchPopupProps) {
  const { t } = useTranslation();
  const groupedVariantCount = groupedProducts.reduce(
    (total, product) => total + product.variants.length,
    0,
  );

  return (
    <S.GroupedProductSearchPopup>
      <S.GroupedProductSearchSummary>
        {t("conversation.clientOrders.drawer.groupedSearchSummary", {
          products: groupedProducts.length,
          variants: groupedVariantCount,
        })}
      </S.GroupedProductSearchSummary>

      {groupedProducts.map((product) => {
        const expanded = expandedProductKeys.has(product.productKey);
        const groupMeta = [
          product.categoryName,
          t("conversation.clientOrders.drawer.groupedVariantCount", {
            count: product.variants.length,
          }),
          product.selectedCount > 0
            ? t("conversation.clientOrders.drawer.groupedSelectedInOrder", {
                count: product.selectedCount,
              })
            : null,
        ].filter(Boolean);

        return (
          <S.GroupedProductSearchGroup key={product.productKey}>
            <S.GroupedProductHeaderButton
              type="button"
              aria-expanded={expanded}
              onMouseDown={keepProductSearchPopupOpen}
              onClick={() => onToggleProduct(product.productKey)}
            >
              <S.GroupedProductCaret aria-hidden="true">
                {expanded ? (
                  <CaretDownIcon size={14} />
                ) : (
                  <CaretRightIcon size={14} />
                )}
              </S.GroupedProductCaret>

              {product.imageUrl ? (
                <S.GroupedProductImage
                  src={product.imageUrl}
                  alt={product.productName}
                />
              ) : (
                <S.GroupedProductImagePlaceholder aria-hidden="true" />
              )}

              <S.GroupedProductCopy>
                <S.GroupedProductName>
                  {product.productName}
                </S.GroupedProductName>
                <S.GroupedProductMeta>
                  {groupMeta.join(" · ")}
                </S.GroupedProductMeta>
              </S.GroupedProductCopy>
            </S.GroupedProductHeaderButton>

            {expanded
              ? product.variants.map((variant) => {
                  const selected = selectedVariantIds.has(variant.id);

                  return (
                    <S.GroupedVariantButton
                      key={variant.id}
                      type="button"
                      aria-disabled={selected || !variant.inStock}
                      $selected={selected}
                      onMouseDown={keepProductSearchPopupOpen}
                      onClick={() => {
                        if (!selected && variant.inStock) {
                          onVariantSelect(variant.id);
                        }
                      }}
                    >
                      <VariantSearchContent
                        selected={selected}
                        variant={variant}
                      />
                    </S.GroupedVariantButton>
                  );
                })
              : null}
          </S.GroupedProductSearchGroup>
        );
      })}
    </S.GroupedProductSearchPopup>
  );
}

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
