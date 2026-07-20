import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";

import { CatalogVariantSearchRow } from "./catalog-variant-search-row";
import * as S from "./catalog-product-search.styled";
import type { GroupedSearchProduct } from "./grouped-product-search-popup.utils";

const keepProductSearchPopupOpen = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

type GroupedProductSearchPopupProps = {
  expandedProductKeys: Set<string>;
  groupedProducts: GroupedSearchProduct[];
  selectedVariantIds: Set<number>;
  onToggleProduct: (productKey: string) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
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
        {t("products.catalogSearch.groupedSearchSummary", {
          products: groupedProducts.length,
          variants: groupedVariantCount,
        })}
      </S.GroupedProductSearchSummary>

      {groupedProducts.map((product) => {
        const expanded = expandedProductKeys.has(product.productKey);
        const groupMeta = [
          product.categoryName,
          t("products.catalogSearch.groupedVariantCount", {
            count: product.variants.length,
          }),
          product.selectedCount > 0
            ? t("products.catalogSearch.groupedSelected", {
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

            {expanded &&
              product.variants.map((variant) => {
                const selected = selectedVariantIds.has(variant.id);
                const disabled = !variant.inStock || selected;

                return (
                  <S.GroupedVariantButton
                    key={variant.id}
                    type="button"
                    disabled={disabled}
                    $disabled={disabled}
                    $selected={selected}
                    onMouseDown={keepProductSearchPopupOpen}
                    onClick={() => {
                      if (!disabled) {
                        onVariantSelect(variant);
                      }
                    }}
                  >
                    <CatalogVariantSearchRow
                      disabled={disabled}
                      selected={selected}
                      variant={variant}
                    />
                  </S.GroupedVariantButton>
                );
              })}
          </S.GroupedProductSearchGroup>
        );
      })}
    </S.GroupedProductSearchPopup>
  );
}
