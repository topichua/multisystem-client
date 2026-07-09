import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { Flex, Typography } from "antd";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  formatCatalogVariantCurrency,
  getCatalogVariantMeta,
  getCatalogVariantUnitPrice,
} from "@/features/products/utils/catalog-variant-display";

import * as S from "../../orders-new-page.styled";
import { formatProductAmount } from "../../orders-new.utils";
import { VariantImage } from "../variant-image";

const { Text } = Typography;

const keepProductSearchPopoverOpen = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

type ProductSearchResultRowProps = {
  variant: CatalogVariant;
  selected: boolean;
  onSelect: (variant: CatalogVariant) => void;
};

export function ProductSearchResultRow({
  variant,
  selected,
  onSelect,
}: ProductSearchResultRowProps) {
  const { t } = useTranslation();

  const meta = getCatalogVariantMeta(variant);
  const disabled = selected || !variant.inStock;

  return (
    <S.SearchResultRow
      type="button"
      disabled={disabled}
      onMouseDown={keepProductSearchPopoverOpen}
      onClick={() => onSelect(variant)}
    >
      <VariantImage variant={variant} size={40} />

      <Flex vertical style={{ minWidth: 0, flex: 1 }}>
        <Text strong ellipsis>
          {variant.product.name}
        </Text>

        <VariantMeta sku={variant.sku} meta={meta} />
      </Flex>

      <Flex vertical align="flex-end" style={{ flexShrink: 0 }}>
        <Text strong>
          {formatProductAmount(
            getCatalogVariantUnitPrice(variant),
            formatCatalogVariantCurrency(variant.product.currency),
          )}
        </Text>

        <Text
          type={variant.inStock ? "success" : "secondary"}
          strong
          style={{ fontSize: 12 }}
        >
          {variant.inStock
            ? t("orders.create.products.stock", {
                count: variant.quantity,
              })
            : t("orders.create.products.outOfStock")}
        </Text>
      </Flex>

      <S.SearchResultAction
        $empty={!selected && !variant.inStock}
        $selected={selected}
      >
        {selected ? (
          <CheckIcon size={14} weight="bold" />
        ) : variant.inStock ? (
          <PlusIcon size={16} weight="bold" />
        ) : null}
      </S.SearchResultAction>
    </S.SearchResultRow>
  );
}

type VariantMetaProps = {
  sku?: string | null;
  meta: string | null;
};

function VariantMeta({ sku, meta }: VariantMetaProps) {
  if (!sku && !meta) {
    return null;
  }

  return (
    <Text type="secondary" ellipsis>
      {sku && meta ? `${sku} · ${meta}` : sku || meta}
    </Text>
  );
}
