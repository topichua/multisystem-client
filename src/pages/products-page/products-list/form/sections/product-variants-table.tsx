import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { isArchivedStatus } from "@/features/products/utils/product-display";

import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { productVariantTableRowHighlightCss } from "../variants/product-variant-highlight.styles";
import {
  PRODUCT_VARIANT_ANCHOR_ATTR,
  PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS,
} from "../variants/scroll-to-product-variant";
import { EmptyVariantsState } from "./empty-variants-state";
import { VariantsBulkPriceBar } from "./variants-bulk-price-bar";

const VARIANT_ROW_ARCHIVED_CLASS = "variant-row-archived";

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

  .ant-table-tbody > tr.${VARIANT_ROW_ARCHIVED_CLASS} {
    opacity: 0.5;
  }

  ${productVariantTableRowHighlightCss}
`;

function VariantTableRow({
  archivedTooltip,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  archivedTooltip?: string;
}) {
  if (!archivedTooltip) {
    return <tr {...props} />;
  }

  return (
    <Tooltip title={archivedTooltip}>
      <tr {...props} />
    </Tooltip>
  );
}

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
  const archivedTooltip = t("products.inventoryDrawer.archivedVariantTooltip");

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
              components={{
                body: {
                  row: (
                    props: HTMLAttributes<HTMLTableRowElement> & {
                      "data-row-key"?: string;
                    },
                  ) => (
                    <VariantTableRow
                      {...props}
                      archivedTooltip={
                        props.className?.includes(VARIANT_ROW_ARCHIVED_CLASS)
                          ? archivedTooltip
                          : undefined
                      }
                    />
                  ),
                },
              }}
              rowClassName={(variant) => {
                const classes: string[] = [];

                if (
                  variant.id != null &&
                  variant.id === highlightedVariantId
                ) {
                  classes.push(PRODUCT_VARIANT_SCROLL_HIGHLIGHT_CLASS);
                }

                if (isArchivedStatus(variant.status)) {
                  classes.push(VARIANT_ROW_ARCHIVED_CLASS);
                }

                return classes.join(" ");
              }}
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
