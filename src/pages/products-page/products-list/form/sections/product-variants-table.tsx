import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { EmptyVariantsState } from "./empty-variants-state";

const { Title, Text } = Typography;

type ProductVariantsTableProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  onAddManualVariant: () => void;
};

export function ProductVariantsTable({
  productVariants,
  variantTableColumns,
  onAddManualVariant,
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
          <Table<ProductVariantUi>
            rowKey="key"
            dataSource={productVariants}
            pagination={false}
            scroll={{ x: 1000 }}
            columns={variantTableColumns}
          />

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
