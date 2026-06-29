import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import type { SelectedCharacteristic } from "../variants/generate-product-variants";
import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { EmptyVariantsState } from "./empty-variants-state";
import { MobileProductVariantCard } from "./mobile-product-variant-card";

const { Title, Text } = Typography;

type MobileProductVariantsListProps = {
  productVariants: ProductVariantUi[];
  selectedCharacteristics: SelectedCharacteristic[];
  variantCustomFields: VariantCustomField[];
  deletingVariantKey: string | null;
  onManageVariantImages: (variant: ProductVariantUi) => void;
  onDeleteVariant: (variant: ProductVariantUi) => void;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  onAddManualVariant: () => void;
};

export function MobileProductVariantsList({
  productVariants,
  selectedCharacteristics,
  variantCustomFields,
  deletingVariantKey,
  onManageVariantImages,
  onDeleteVariant,
  onUpdateManualVariantCustomField,
  onAddManualVariant,
}: MobileProductVariantsListProps) {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={12} data-qa="products-mobile-variants">
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
          <Flex vertical gap={12}>
            {productVariants.map((variant, index) => (
              <MobileProductVariantCard
                key={variant.key}
                variant={variant}
                variantIndex={index}
                selectedCharacteristics={selectedCharacteristics}
                availableFields={variantCustomFields}
                deletingVariantKey={deletingVariantKey}
                onManageVariantImages={onManageVariantImages}
                onDeleteVariant={onDeleteVariant}
                onUpdateManualVariantCustomField={
                  onUpdateManualVariantCustomField
                }
              />
            ))}
          </Flex>

          <Button
            block
            icon={<PlusIcon />}
            onClick={onAddManualVariant}
            style={{ alignSelf: "stretch" }}
          >
            {t("products.variantAddCta")}
          </Button>
        </>
      )}
    </Flex>
  );
}
