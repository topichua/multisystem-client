import { Card, Flex, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { SelectedCharacteristic } from "../variants/generate-product-variants";
import type { ProductVariantUi } from "../variants/product-add-variant.types";
import type { ProductOptionCharacteristicsBaseline } from "../variants/product-option-baseline";
import {
  ProductCharacteristicsBuilder,
  type ProductCharacteristicBuilderRow,
} from "./product-characteristics-builder";
import { MobileProductVariantsList } from "./mobile-product-variants-list";
import { ProductVariantsTable } from "./product-variants-table";

const { Title, Text } = Typography;

export type ProductVariantsSectionProps = {
  productVariants: ProductVariantUi[];
  variantTableColumns: ColumnsType<ProductVariantUi>;
  watchedCharacteristics: ProductCharacteristicBuilderRow[] | undefined;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
  optionBaseline: ProductOptionCharacteristicsBaseline;
  optionEditRestrictionsActive: boolean;
  getCharacteristicValueOptions: (
    attributeId?: number,
  ) => Array<{ value: string; label: string }>;
  onAddManualVariant: () => void;
  selectedCharacteristics: SelectedCharacteristic[];
  onManageVariantImages: (variant: ProductVariantUi) => void;
  onDeleteVariant: (variant: ProductVariantUi) => void;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  deletingVariantKey: string | null;
  showQuantityField: boolean;
  onApplyPriceToAllVariants: (price: number) => void;
  isMobile?: boolean;
};

export const ProductVariantsSection = ({
  productVariants,
  variantTableColumns,
  watchedCharacteristics,
  variantCustomFields,
  isVariantCustomFieldsLoading,
  optionBaseline,
  optionEditRestrictionsActive,
  getCharacteristicValueOptions,
  onAddManualVariant,
  selectedCharacteristics,
  onManageVariantImages,
  onDeleteVariant,
  onUpdateManualVariantCustomField,
  deletingVariantKey,
  showQuantityField,
  onApplyPriceToAllVariants,
  isMobile = false,
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
          optionBaseline={optionBaseline}
          optionEditRestrictionsActive={optionEditRestrictionsActive}
          getCharacteristicValueOptions={getCharacteristicValueOptions}
          isMobile={isMobile}
        />

        {isMobile ? (
          <MobileProductVariantsList
            productVariants={productVariants}
            selectedCharacteristics={selectedCharacteristics}
            variantCustomFields={variantCustomFields}
            deletingVariantKey={deletingVariantKey}
            onManageVariantImages={onManageVariantImages}
            onDeleteVariant={onDeleteVariant}
            onUpdateManualVariantCustomField={onUpdateManualVariantCustomField}
            showQuantityField={showQuantityField}
            onAddManualVariant={onAddManualVariant}
            onApplyPriceToAllVariants={onApplyPriceToAllVariants}
            isMobile
          />
        ) : (
          <ProductVariantsTable
            productVariants={productVariants}
            variantTableColumns={variantTableColumns}
            onAddManualVariant={onAddManualVariant}
            onApplyPriceToAllVariants={onApplyPriceToAllVariants}
          />
        )}
      </Flex>
    </Card>
  );
};
