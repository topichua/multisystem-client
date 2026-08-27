import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import {
  formatCatalogVariantPrice,
  getCatalogVariantMeta,
  resolveCatalogVariantImageSrc,
} from "@/features/products/utils/catalog-variant-display";

import * as S from "./catalog-product-search.styled";

type CatalogVariantSearchRowProps = {
  disabled?: boolean;
  selected: boolean;
  variant: CatalogVariant;
};

export function CatalogVariantSearchRow({
  disabled = false,
  selected,
  variant,
}: CatalogVariantSearchRowProps) {
  const { t } = useTranslation();
  const meta = getCatalogVariantMeta(variant);
  const variantImageUrl = resolveCatalogVariantImageSrc(variant);
  const stockLabel = selected
    ? t("products.catalogSearch.alreadyAdded")
    : variant.inStock
      ? t("products.catalogSearch.variantInStock", {
          count: variant.quantity,
        })
      : t("products.catalogSearch.outOfStock");

  return (
    <>
      <S.GroupedVariantImage src={variantImageUrl} alt={variant.label} />

      <S.GroupedVariantCopy>
        <S.GroupedVariantNameRow>
          <VariantWishlistBadge count={variant.wishlistCount} compact />
          <S.GroupedVariantName>{variant.product.name}</S.GroupedVariantName>
        </S.GroupedVariantNameRow>
        {meta && <S.GroupedVariantMeta>{meta}</S.GroupedVariantMeta>}meta
      </S.GroupedVariantCopy>

      <S.GroupedVariantInventory>
        <S.GroupedVariantPrice>
          {formatCatalogVariantPrice(variant)}
        </S.GroupedVariantPrice>
        <S.GroupedVariantStock
          $available={variant.inStock && !selected}
          $muted={disabled}
        >
          {stockLabel}
        </S.GroupedVariantStock>
      </S.GroupedVariantInventory>

      <S.GroupedVariantAction
        $empty={!selected && !variant.inStock}
        $selected={selected}
      >
        {selected ? (
          <CheckIcon size={14} weight="bold" />
        ) : variant.inStock ? (
          <PlusIcon size={16} weight="bold" />
        ) : null}
      </S.GroupedVariantAction>
    </>
  );
}
