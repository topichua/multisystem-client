import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  formatCatalogVariantPrice,
  getCatalogVariantImageUrl,
  getCatalogVariantMeta,
} from "@/features/products/utils/catalog-variant-display";

import * as S from "./client-order-product-search.styled";

type VariantSearchContentProps = {
  selected: boolean;
  variant: CatalogVariant;
};

export function VariantSearchContent({
  selected,
  variant,
}: VariantSearchContentProps) {
  const { t } = useTranslation();
  const meta = getCatalogVariantMeta(variant);
  const variantImageUrl = getCatalogVariantImageUrl(variant);
  const outOfStockLabel = t(
    "conversation.clientOrders.drawer.groupedOutOfStock",
  );
  const stockLabel = variant.inStock
    ? t("conversation.clientOrders.drawer.variantInStock", {
        count: variant.quantity,
      })
    : outOfStockLabel;

  return (
    <>
      {variantImageUrl ? (
        <S.GroupedVariantImage src={variantImageUrl} alt={variant.label} />
      ) : (
        <S.GroupedVariantImagePlaceholder aria-hidden="true" />
      )}

      <S.GroupedVariantCopy>
        <S.GroupedVariantName>{variant.product.name}</S.GroupedVariantName>
        {meta ? <S.GroupedVariantMeta>{meta}</S.GroupedVariantMeta> : null}
      </S.GroupedVariantCopy>

      <S.GroupedVariantInventory>
        <S.GroupedVariantPrice>
          {formatCatalogVariantPrice(variant)}
        </S.GroupedVariantPrice>
        <S.GroupedVariantStock $available={variant.inStock}>
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
