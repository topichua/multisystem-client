import { TrashIcon } from "@phosphor-icons/react";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { VariantWishlistBadge } from "@/features/products/components/variant-wishlist-badge/variant-wishlist-badge";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import { getProductVariantTitle } from "@/features/products/utils/product-display";

import type { SelectedCharacteristic } from "../variants/generate-product-variants";
import type { ProductVariantUi } from "../variants/product-add-variant.types";
import {
  getCharacteristicValueOptions,
  resolveSelectedCharacteristicColumns,
} from "../variants/product-add-variant.utils";
import {
  isColorLikeCharacteristicField,
  resolveCharacteristicDisplayColor,
} from "../variants/variant-characteristic-display";

const { Text } = Typography;

const ColorSwatch = styled.span<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.theme.colors.functional.border.split};
`;

const VariantImageThumb = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const FieldBlock = styled.div`
  min-width: 0;
  width: 100%;
`;

const FieldLabel = styled(Text)`
  && {
    display: block;
    margin-bottom: 6px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.25;
  }
`;

function getCustomFieldStableKey(
  field: ProductVariantUi["customFields"][number],
): string {
  if (!field.field) {
    return `existing:${field.fieldId}`;
  }

  return field.field.kind === "existing"
    ? `existing:${field.field.id}`
    : `new:${field.field.clientKey}`;
}

type MobileProductVariantCardProps = {
  variant: ProductVariantUi;
  variantIndex: number;
  selectedCharacteristics: SelectedCharacteristic[];
  availableFields: VariantCustomField[];
  deletingVariantKey: string | null;
  onManageVariantImages: (variant: ProductVariantUi) => void;
  onDeleteVariant: (variant: ProductVariantUi) => void;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  showQuantityField: boolean;
};

export function MobileProductVariantCard({
  variant,
  variantIndex,
  selectedCharacteristics,
  availableFields,
  deletingVariantKey,
  onManageVariantImages,
  onDeleteVariant,
  onUpdateManualVariantCustomField,
  showQuantityField,
}: MobileProductVariantCardProps) {
  const { t } = useTranslation();
  const variantQaId = variant.id ?? variant.key;
  const title = getProductVariantTitle(variant);
  const mainImage = variant.media[0];
  const characteristicColumns = resolveSelectedCharacteristicColumns(
    selectedCharacteristics,
  );

  return (
    <Card
      size="small"
      data-qa={`products-mobile-variant-${variantQaId}`}
      styles={{ body: { padding: 12 } }}
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8}>
          <VariantWishlistBadge count={variant.wishlistCount ?? 0} compact />
          <Text strong>
            {title || `${t("products.variant.fallbackName")} #${variantQaId}`}
          </Text>
        </Flex>

        {characteristicColumns.map((column) => {
          const currentValue =
            variant.customFields.find(
              (field) =>
                getCustomFieldStableKey(field) === column.fieldStableKey,
            )?.value ?? "";
          const field = availableFields.find(
            (item) => item.id === column.fieldId,
          );
          const isOptionsField =
            column.fieldType === "OPTION" || field?.type === "options";
          const options = getCharacteristicValueOptions(
            column.fieldId,
            availableFields,
          );

          if (variant.source === "manual") {
            return (
              <FieldBlock key={column.fieldStableKey}>
                <FieldLabel>{column.fieldLabel}</FieldLabel>
                {isOptionsField && options.length > 0 ? (
                  <Select
                    value={currentValue || undefined}
                    placeholder={t("products.characteristics.selectValue")}
                    options={options}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      onUpdateManualVariantCustomField(
                        variant.key,
                        column.fieldStableKey,
                        value,
                      )
                    }
                  />
                ) : (
                  <Input
                    value={currentValue}
                    placeholder={t("products.characteristics.enterValue")}
                    onChange={(event) =>
                      onUpdateManualVariantCustomField(
                        variant.key,
                        column.fieldStableKey,
                        event.target.value,
                      )
                    }
                  />
                )}
              </FieldBlock>
            );
          }

          const displayValue = currentValue.trim() ? currentValue : "—";
          const swatchColor = isColorLikeCharacteristicField({
            key: column.fieldKey,
            label: column.fieldLabel,
          })
            ? resolveCharacteristicDisplayColor(currentValue)
            : null;

          return (
            <FieldBlock key={column.fieldStableKey}>
              <FieldLabel>{column.fieldLabel}</FieldLabel>
              <Flex align="center" gap={8}>
                {swatchColor && (
                  <ColorSwatch $color={swatchColor} aria-hidden />
                )}
                <Text>{displayValue}</Text>
              </Flex>
            </FieldBlock>
          );
        })}

        <FieldBlock>
          <FieldLabel>{t("products.variant.images")}</FieldLabel>
          <Flex align="center" gap={12} wrap="wrap">
            {mainImage && (
              <VariantImageThumb src={mainImage.src} alt="" />
            )}
            <Flex vertical gap={4} style={{ minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("products.variant.imageCount", {
                  count: variant.media.length,
                })}
              </Text>
              <Button
                size="small"
                onClick={() => onManageVariantImages(variant)}
              >
                {variant.media.length > 0
                  ? t("products.variant.manageImages")
                  : t("products.variant.addImages")}
              </Button>
            </Flex>
          </Flex>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>{t("products.variant.sku")}</FieldLabel>
          <Form.Item name={["variants", variantIndex, "key"]} hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name={["variants", variantIndex, "sku"]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="SKU-0001" />
          </Form.Item>
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>
            {t("products.variant.price")} <Text type="danger">*</Text>
          </FieldLabel>
          <Form.Item
            name={["variants", variantIndex, "price"]}
            rules={[{ required: true, message: t("products.form.required") }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        </FieldBlock>

        {showQuantityField && (
          <FieldBlock>
            <FieldLabel>
              {t("products.variant.quantity")} <Text type="danger">*</Text>
            </FieldLabel>
            <Form.Item
              name={["variants", variantIndex, "quantity"]}
              rules={[{ required: true, message: t("products.form.required") }]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
            </Form.Item>
          </FieldBlock>
        )}

        <FieldBlock>
          <FieldLabel>{t("products.variant.discountPrice")}</FieldLabel>
          <Form.Item
            name={["variants", variantIndex, "discountPrice"]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        </FieldBlock>

        <Button
          danger
          block
          icon={<TrashIcon />}
          loading={deletingVariantKey === variant.key}
          disabled={deletingVariantKey != null}
          data-qa={`products-mobile-variant-delete-${variantQaId}`}
          onClick={() => onDeleteVariant(variant)}
        >
          {t("products.delete")}
        </Button>
      </Flex>
    </Card>
  );
}
