import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { productVariantTableRowHighlightCss } from "../variants/product-variant-highlight.styles";
import {
  PRODUCT_VARIANT_ANCHOR_ATTR,
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS,
} from "../variants/scroll-to-product-variant";
import { EmptyVariantsState } from "./empty-variants-state";
import { VariantsBulkPriceBar } from "./variants-bulk-price-bar";

const VariantsTableValidationScope = styled.div`
  .ant-table-cell .ant-form-item {
    position: relative;
  }

  .ant-table-cell .ant-form-item-additional {
    position: absolute;
    top: 100%;
    left: 0;
    min-height: 0;
    z-index: 1;
  }

  .ant-table-cell-fix-right {
    overflow: visible;
  }

  ${productVariantTableRowHighlightCss}
`;

type ProductVariantsTableProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  onAddManualVariant: () => void;
  onApplyPriceToAllVariants: (price: number) => void;
  showInventorySummary?: boolean;
  showInventoryManagement?: boolean;
  onOpenInventory?: () => void;
  highlightedVariantId?: number | null;
};

export function ProductVariantsTable({
  productVariants,
  variantTableColumns,
  onAddManualVariant,
  onApplyPriceToAllVariants,
  showInventorySummary = false,
  showInventoryManagement = false,
  onOpenInventory,
  highlightedVariantId = null,
}: ProductVariantsTableProps) {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={12}>
      {productVariants.length === 0 ? (
        <EmptyVariantsState onAddManualVariant={onAddManualVariant} />
      ) : (
        <>
          <VariantsBulkPriceBar
            productVariants={productVariants}
            onApplyPriceToAll={onApplyPriceToAllVariants}
            showInventorySummary={showInventorySummary}
            showInventoryManagement={showInventoryManagement}
            onOpenInventory={onOpenInventory}
          />

          <VariantsTableValidationScope>
            <Table<ProductVariantUi>
              rowKey="key"
              dataSource={productVariants}
              pagination={false}
              scroll={{ x: "max-content" }}
              size="small"
              columns={variantTableColumns}
              rowClassName={(variant) =>
                variant.id != null && variant.id === highlightedVariantId
                  ? PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS
                  : ""
              }
              onRow={(variant) => {
                if (variant.id == null) {
                  return {};
                }

                return {
                  [PRODUCT_VARIANT_ANCHOR_ATTR]: String(variant.id),
                } as HTMLAttributes<HTMLElement>;
              }}
            />
          </VariantsTableValidationScope>

          <Button
            icon={<PlusIcon />}
            onClick={onAddManualVariant}
            style={{ alignSelf: "flex-start" }}
          >
            {t("products.variantAddCta")}
          </Button>
        </>
      )}
    </Flex>
  );
}
