import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import { resolveProductImageSrc } from "@/features/products/utils/product-display";

import { CatalogVariantSearchOption } from "./catalog-variant-search-row";
import * as S from "./catalog-product-search.styled";
import type { GroupedSearchProduct } from "./grouped-product-search-popup.utils";

const keepProductSearchPopupOpen = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const defaultIsVariantDisabled = (variant: CatalogVariant, selected: boolean) =>
  !variant.inStock || selected;

type GroupedProductSearchPopupProps = {
  embedded?: boolean;
  expandedProductKeys: Set<string>;
  groupedProducts: GroupedSearchProduct[];
  selectedVariantIds: Set<number>;
  isVariantDisabled?: (variant: CatalogVariant, selected: boolean) => boolean;
  preventPopupClose?: boolean;
  onToggleProduct: (productKey: string) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function GroupedProductSearchPopup({
  embedded = false,
  expandedProductKeys,
  groupedProducts,
  selectedVariantIds,
  isVariantDisabled = defaultIsVariantDisabled,
  preventPopupClose = true,
  onToggleProduct,
  onVariantSelect,
}: GroupedProductSearchPopupProps) {
  const { t } = useTranslation();
  const groupedVariantCount = groupedProducts.reduce(
    (total, product) => total + product.variants.length,
    0,
  );

  const popupMouseDown = preventPopupClose
    ? keepProductSearchPopupOpen
    : undefined;

  return (
    <S.GroupedProductSearchPopup $embedded={embedded}>
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
              onMouseDown={popupMouseDown}
              onClick={() => onToggleProduct(product.productKey)}
            >
              <S.GroupedProductCaret aria-hidden="true">
                {expanded ? (
                  <CaretDownIcon size={14} />
                ) : (
                  <CaretRightIcon size={14} />
                )}
              </S.GroupedProductCaret>

              <S.GroupedProductImage
                src={resolveProductImageSrc(product.imageUrl)}
                alt={product.productName}
              />

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
                const disabled = isVariantDisabled(variant, selected);

                return (
                  <CatalogVariantSearchOption
                    key={variant.id}
                    disabled={disabled}
                    indented
                    selected={selected}
                    variant={variant}
                    onMouseDown={popupMouseDown}
                    onSelect={onVariantSelect}
                  />
                );
              })}
          </S.GroupedProductSearchGroup>
        );
      })}
    </S.GroupedProductSearchPopup>
  );
}
