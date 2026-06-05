import { TrashIcon } from "@phosphor-icons/react";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import type { SelectedCharacteristic } from "./generate-product-variants";
import type {
  ProductVariantUi,
  ProductVariantUiCustomField,
} from "./product-add-variant.types";
import {
  getCharacteristicValueOptions,
  resolveSelectedCharacteristicColumns,
  type SelectedCharacteristicColumn,
} from "./product-add-variant.utils";
import {
  isColorLikeCharacteristicField,
  resolveCharacteristicDisplayColor,
} from "./variant-characteristic-display";

const { Text } = Typography;

const ColorSwatch = styled.span<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.theme.colors.functional.border.split};
`;

function getCustomFieldStableKey(field: ProductVariantUiCustomField): string {
  if (!field.field) {
    return `existing:${field.fieldId}`;
  }

  return field.field.kind === "existing"
    ? `existing:${field.field.id}`
    : `new:${field.field.clientKey}`;
}

function renderGeneratedCharacteristicValue(
  column: SelectedCharacteristicColumn,
  record: ProductVariantUi,
) {
  const value =
    record.customFields.find(
      (field) => getCustomFieldStableKey(field) === column.fieldStableKey,
    )?.value ?? "";
  const displayValue = value.trim() ? value : "—";

  if (
    !isColorLikeCharacteristicField({
      key: column.fieldKey,
      label: column.fieldLabel,
    })
  ) {
    return <Text>{displayValue}</Text>;
  }

  const swatchColor = resolveCharacteristicDisplayColor(value);

  return (
    <Flex align="center" gap={8}>
      {swatchColor ? <ColorSwatch $color={swatchColor} aria-hidden /> : null}
      <Text>{displayValue}</Text>
    </Flex>
  );
}

type RenderManualCharacteristicCellParams = {
  column: SelectedCharacteristicColumn;
  record: ProductVariantUi;
  availableFields: VariantCustomField[];
  onUpdateCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  texts: {
    selectValue: string;
    enterValue: string;
  };
};

function renderManualCharacteristicCell({
  column,
  record,
  availableFields,
  onUpdateCustomField,
  texts,
}: RenderManualCharacteristicCellParams) {
  const currentValue =
    record.customFields.find(
      (field) => getCustomFieldStableKey(field) === column.fieldStableKey,
    )?.value ?? "";
  const field = availableFields.find((item) => item.id === column.fieldId);
  const isOptionsField =
    column.fieldType === "OPTION" || field?.type === "options";
  const options = getCharacteristicValueOptions(
    column.fieldId,
    availableFields,
  );

  if (isOptionsField && options.length > 0) {
    return (
      <Select
        value={currentValue || undefined}
        placeholder={texts.selectValue}
        options={options}
        style={{ width: "100%" }}
        onChange={(value) =>
          onUpdateCustomField(record.key, column.fieldStableKey, value)
        }
      />
    );
  }

  return (
    <Input
      value={currentValue}
      placeholder={texts.enterValue}
      onChange={(event) =>
        onUpdateCustomField(
          record.key,
          column.fieldStableKey,
          event.target.value,
        )
      }
    />
  );
}

type UseProductAddVariantTableColumnsParams = {
  selectedCharacteristics: SelectedCharacteristic[];
  availableFields: VariantCustomField[];
  onManageVariantImages: (variant: ProductVariantUi) => void;
  onDeleteVariant: (variant: ProductVariantUi) => void;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  deletingVariantKey: string | null;
};

const VariantImageThumb = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

export function useProductAddVariantTableColumns({
  selectedCharacteristics,
  availableFields,
  onManageVariantImages,
  onDeleteVariant,
  onUpdateManualVariantCustomField,
  deletingVariantKey,
}: UseProductAddVariantTableColumnsParams): ColumnsType<ProductVariantUi> {
  const { t } = useTranslation();

  return useMemo((): ColumnsType<ProductVariantUi> => {
    const characteristicColumns = resolveSelectedCharacteristicColumns(
      selectedCharacteristics,
    ).map((column) => ({
      title: column.fieldLabel,
      key: `characteristic-${column.fieldStableKey}`,
      width: 180,
      render: (_: unknown, record: ProductVariantUi) => {
        if (record.source === "manual") {
          return renderManualCharacteristicCell({
            column,
            record,
            availableFields,
            onUpdateCustomField: onUpdateManualVariantCustomField,
            texts: {
              selectValue: t("products.characteristics.selectValue"),
              enterValue: t("products.characteristics.enterValue"),
            },
          });
        }

        return renderGeneratedCharacteristicValue(column, record);
      },
    }));

    return [
      {
        title: t("products.variant.images"),
        key: "images",
        width: 220,
        fixed: "left",
        render: (_: unknown, record: ProductVariantUi) => {
          const mainImage = record.media[0];

          return (
            <Flex align="center" gap={8}>
              {mainImage ? (
                <VariantImageThumb src={mainImage.src} alt="" />
              ) : null}

              <Flex vertical gap={4} style={{ minWidth: 0 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("products.variant.imageCount", {
                    count: record.media.length,
                  })}
                </Text>

                <Button
                  size="small"
                  onClick={() => onManageVariantImages(record)}
                >
                  {record.media.length > 0
                    ? t("products.variant.manageImages")
                    : t("products.variant.addImages")}
                </Button>
              </Flex>
            </Flex>
          );
        },
      },
      ...characteristicColumns,
      {
        title: t("products.variant.sku"),
        dataIndex: "sku",
        width: 180,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <>
            <Form.Item name={["variants", index, "key"]} hidden>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item
              name={["variants", index, "sku"]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="SKU-0001" />
            </Form.Item>
          </>
        ),
      },
      {
        title: (
          <span>
            {t("products.variant.price")} <Text type="danger">*</Text>
          </span>
        ),
        dataIndex: "price",
        width: 160,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <Form.Item
            name={["variants", index, "price"]}
            rules={[{ required: true, message: t("products.form.required") }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        ),
      },
      {
        title: (
          <span>
            {t("products.variant.quantity")} <Text type="danger">*</Text>
          </span>
        ),
        dataIndex: "quantity",
        width: 160,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <Form.Item
            name={["variants", index, "quantity"]}
            rules={[{ required: true, message: t("products.form.required") }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
          </Form.Item>
        ),
      },
      {
        title: t("products.variant.discountPrice"),
        dataIndex: "discountPrice",
        width: 180,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <Form.Item
            name={["variants", index, "discountPrice"]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        ),
      },
      {
        title: t("products.table.actions"),
        dataIndex: "actions",
        width: 100,
        fixed: "right",
        render: (_: unknown, record: ProductVariantUi) => (
          <Button
            danger
            icon={<TrashIcon />}
            loading={deletingVariantKey === record.key}
            disabled={deletingVariantKey != null}
            onClick={() => onDeleteVariant(record)}
          />
        ),
      },
    ];
  }, [
    availableFields,
    deletingVariantKey,
    onDeleteVariant,
    onManageVariantImages,
    onUpdateManualVariantCustomField,
    selectedCharacteristics,
    t,
  ]);
}
