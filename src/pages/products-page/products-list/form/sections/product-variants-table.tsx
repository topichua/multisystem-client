import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { EmptyVariantsState } from "./empty-variants-state";
import { VariantsBulkPriceBar } from "./variants-bulk-price-bar";

const { Title, Text } = Typography;

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
`;

type ProductVariantsTableProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  onAddManualVariant: () => void;
  onApplyPriceToAllVariants: (price: number) => void;
};

export function ProductVariantsTable({
  productVariants,
  variantTableColumns,
  onAddManualVariant,
  onApplyPriceToAllVariants,
}: ProductVariantsTableProps) {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={12}>
      <Title level={5} style={{ margin: 0 }}>
        {t("products.variantsForm.variants")}{" "}
        <Text type="secondary" style={{ fontSize: 14 }}>
          {productVariants.length}
        </Text>
      </Title>

      {productVariants.length === 0 ? (
        <EmptyVariantsState onAddManualVariant={onAddManualVariant} />
      ) : (
        <>
          <VariantsBulkPriceBar
            onApplyPriceToAll={onApplyPriceToAllVariants}
          />

          <VariantsTableValidationScope>
            <Table<ProductVariantUi>
              rowKey="key"
              dataSource={productVariants}
              pagination={false}
              scroll={{ x: 1000 }}
              columns={variantTableColumns}
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
