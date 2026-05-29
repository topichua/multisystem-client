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
import styled from "styled-components";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";

import type { SelectedCharacteristic } from "./generate-product-variants";
import type { ProductVariantUi } from "./product-add-variant.types";
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

function renderGeneratedCharacteristicValue(
  column: SelectedCharacteristicColumn,
  record: ProductVariantUi,
) {
  const value =
    record.customFields.find((field) => field.fieldId === column.fieldId)
      ?.value ?? "";
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
    fieldId: number,
    value: string,
  ) => void;
};

function renderManualCharacteristicCell({
  column,
  record,
  availableFields,
  onUpdateCustomField,
}: RenderManualCharacteristicCellParams) {
  const currentValue =
    record.customFields.find((field) => field.fieldId === column.fieldId)
      ?.value ?? "";
  const field = availableFields.find((item) => item.id === column.fieldId);
  const isOptionsField = field?.type === "options";
  const options = getCharacteristicValueOptions(
    column.fieldId,
    availableFields,
  );

  if (isOptionsField && options.length > 0) {
    return (
      <Select
        value={currentValue || undefined}
        placeholder="Select value"
        options={options}
        style={{ width: "100%" }}
        onChange={(value) =>
          onUpdateCustomField(record.key, column.fieldId, value)
        }
      />
    );
  }

  return (
    <Input
      value={currentValue}
      placeholder="Enter value"
      onChange={(event) =>
        onUpdateCustomField(record.key, column.fieldId, event.target.value)
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
    fieldId: number,
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
  return useMemo((): ColumnsType<ProductVariantUi> => {
    const characteristicColumns = resolveSelectedCharacteristicColumns(
      selectedCharacteristics,
      availableFields,
    ).map((column) => ({
      title: column.fieldLabel,
      key: `characteristic-${column.fieldId}`,
      width: 180,
      render: (_: unknown, record: ProductVariantUi) => {
        if (record.source === "manual") {
          return renderManualCharacteristicCell({
            column,
            record,
            availableFields,
            onUpdateCustomField: onUpdateManualVariantCustomField,
          });
        }

        return renderGeneratedCharacteristicValue(column, record);
      },
    }));

    return [
      {
        title: "Images",
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
                  {record.media.length} image
                  {record.media.length === 1 ? "" : "s"}
                </Text>

                <Button
                  size="small"
                  onClick={() => onManageVariantImages(record)}
                >
                  {record.media.length > 0 ? "Manage images" : "Add images"}
                </Button>
              </Flex>
            </Flex>
          );
        },
      },
      ...characteristicColumns,
      {
        title: "SKU",
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
            Price <Text type="danger">*</Text>
          </span>
        ),
        dataIndex: "price",
        width: 160,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <Form.Item
            name={["variants", index, "price"]}
            rules={[{ required: true, message: "Required" }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        ),
      },
      {
        title: (
          <span>
            Quantity <Text type="danger">*</Text>
          </span>
        ),
        dataIndex: "quantity",
        width: 160,
        render: (_: unknown, _record: ProductVariantUi, index: number) => (
          <Form.Item
            name={["variants", index, "quantity"]}
            rules={[{ required: true, message: "Required" }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
          </Form.Item>
        ),
      },
      {
        title: "Discount price",
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
        title: "Actions",
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
  ]);
}
