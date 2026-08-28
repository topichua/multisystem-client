import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
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
        {meta && <S.GroupedVariantMeta>{meta}</S.GroupedVariantMeta>}
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
        $empty={disabled && !selected}
        $selected={selected}
      >
        {selected ? (
          <CheckIcon size={14} weight="bold" />
        ) : disabled ? null : (
          <PlusIcon size={16} weight="bold" />
        )}
      </S.GroupedVariantAction>
    </>
  );
}

type CatalogVariantSearchOptionProps = {
  disabled?: boolean;
  indented?: boolean;
  selected?: boolean;
  variant: CatalogVariant;
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelect: (variant: CatalogVariant) => void;
};

export function CatalogVariantSearchOption({
  disabled = false,
  indented = false,
  selected = false,
  variant,
  onMouseDown,
  onSelect,
}: CatalogVariantSearchOptionProps) {
  return (
    <S.GroupedVariantButton
      type="button"
      disabled={disabled}
      $disabled={disabled}
      $indented={indented}
      $selected={selected}
      onMouseDown={onMouseDown}
      onClick={() => {
        if (!disabled) {
          onSelect(variant);
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
}
