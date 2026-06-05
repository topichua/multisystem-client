import { Card, Flex, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { ProductVariantUi } from "../variants/product-add-variant.types";
import {
  ProductCharacteristicsBuilder,
  type ProductCharacteristicBuilderRow,
} from "./product-characteristics-builder";
import { ProductVariantsTable } from "./product-variants-table";

const { Title, Text } = Typography;

export type ProductVariantsSectionProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  watchedCharacteristics: ProductCharacteristicBuilderRow[] | undefined;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
  getCharacteristicValueOptions: (
    attributeId?: number,
  ) => Array<{ value: string; label: string }>;
  onAddManualVariant: () => void;
};

export const ProductVariantsSection = ({
  productVariants,
  variantTableColumns,
  watchedCharacteristics,
  variantCustomFields,
  isVariantCustomFieldsLoading,
  getCharacteristicValueOptions,
  onAddManualVariant,
}: ProductVariantsSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <Flex vertical gap={24}>
        <Flex vertical gap={4}>
          <Title level={5} style={{ margin: 0 }}>
            {t("products.variantsForm.title")}
          </Title>

          <Text type="secondary">{t("products.variantsForm.description")}</Text>
        </Flex>

        <ProductCharacteristicsBuilder
          watchedCharacteristics={watchedCharacteristics}
          variantCustomFields={variantCustomFields}
          isVariantCustomFieldsLoading={isVariantCustomFieldsLoading}
          getCharacteristicValueOptions={getCharacteristicValueOptions}
        />

        <ProductVariantsTable
          productVariants={productVariants}
          variantTableColumns={variantTableColumns}
          onAddManualVariant={onAddManualVariant}
        />
      </Flex>
    </Card>
  );
};
