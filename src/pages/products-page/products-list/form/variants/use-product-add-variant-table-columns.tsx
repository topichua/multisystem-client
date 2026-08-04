import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CubeIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Button,
  Badge,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import {
  getStockQuantityBadgeStatus,
  isArchivedStatus,
} from "@/features/products/utils/product-display";

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
};

const ColorSwatch = styled.span<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.theme.colors.functional.border.split};
`;

const PurchasePriceCell = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
`;

const PurchasePriceValue = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: 13px;
  line-height: 1.3;
`;

const PurchaseMarginPercent = styled.span<{
  $tone: "positive" | "negative";
}>`
  color: ${({ $tone, theme }) =>
    $tone === "positive"
      ? theme.colors.functional.text.success
      : theme.colors.functional.text.error};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
`;

function getMarginPercent(
  price: number | null | undefined,
  purchasePrice: number | null | undefined,
): number | null {
  if (price == null || purchasePrice == null || purchasePrice <= 0) {
    return null;
  }

  return Math.round(((price - purchasePrice) / purchasePrice) * 100);
}

function normalizePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function renderPurchasePriceValue(
  price: number | null,
  purchasePrice: number | null | undefined,
  currencySymbol: string,
) {
  if (purchasePrice == null || purchasePrice <= 0) {
    return <Text type="secondary">—</Text>;
  }

  const marginPercent = getMarginPercent(price, purchasePrice);

  return (
    <PurchasePriceCell>
      <PurchasePriceValue>
        {purchasePrice.toLocaleString()} {currencySymbol}
      </PurchasePriceValue>
      {marginPercent != null && (
        <PurchaseMarginPercent
          $tone={marginPercent >= 0 ? "positive" : "negative"}
        >
          {marginPercent > 0 ? "+" : ""}
          {marginPercent}%
        </PurchaseMarginPercent>
      )}
    </PurchasePriceCell>
  );
}

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
      {swatchColor && <ColorSwatch $color={swatchColor} aria-hidden />}
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
  onArchiveVariant?: (variant: ProductVariantUi) => void;
  onUnarchiveVariant?: (variant: ProductVariantUi) => void;
  onOpenInventory?: (variant: ProductVariantUi) => void;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  deletingVariantKey: string | null;
  deleteLoadingVariantId?: number | null;
  archiveLoadingVariantId?: number | null;
  showQuantityColumn: boolean;
  showInventoryManagement?: boolean;
  showPurchasePriceColumn?: boolean;
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
  onArchiveVariant,
  onUnarchiveVariant,
  onOpenInventory,
  onUpdateManualVariantCustomField,
  deletingVariantKey,
  deleteLoadingVariantId = null,
  archiveLoadingVariantId = null,
  showQuantityColumn,
  showInventoryManagement = false,
  showPurchasePriceColumn = false,
}: UseProductAddVariantTableColumnsParams): ColumnsType<ProductVariantUi> {
  const { t } = useTranslation();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;

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
              {mainImage && <VariantImageThumb src={mainImage.src} alt="" />}

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
              <Input placeholder={t("products.form.skuPlaceholder")} />
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
      ...(showPurchasePriceColumn
        ? [
            {
              title: t("products.variant.purchasePrice"),
              key: "purchasePrice",
              width: 140,
              render: (_: unknown, record: ProductVariantUi, index: number) => (
                <Form.Item
                  noStyle
                  shouldUpdate={(previous, current) =>
                    previous?.variants?.[index]?.price !==
                    current?.variants?.[index]?.price
                  }
                >
                  {({ getFieldValue }) => {
                    const formPrice = normalizePrice(
                      getFieldValue(["variants", index, "price"]),
                    );
                    const currentPrice =
                      formPrice ?? normalizePrice(record.price);

                    return renderPurchasePriceValue(
                      currentPrice,
                      record.avgPurchasePrice,
                      currencySymbol,
                    );
                  }}
                </Form.Item>
              ),
            },
          ]
        : []),
      ...(showQuantityColumn
        ? [
            {
              title: (
                <span>
                  {t("products.variant.quantity")} <Text type="danger">*</Text>
                </span>
              ),
              dataIndex: "quantity",
              width: 160,
              render: (
                _: unknown,
                _record: ProductVariantUi,
                index: number,
              ) => (
                <Form.Item
                  name={["variants", index, "quantity"]}
                  rules={[
                    {
                      required: true,
                      message: t("products.form.required"),
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    min={0}
                    placeholder="0"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ),
            },
          ]
        : showInventoryManagement
          ? [
              {
                title: t("products.variant.stock"),
                key: "stock",
                dataIndex: "quantity",
                width: 120,
                render: (_: unknown, record: ProductVariantUi) => {
                  const quantity = Number(record.quantity ?? 0);
                  const isEmpty = quantity <= 0;

                  return (
                    <Flex align="center" gap={6}>
                      <Badge status={getStockQuantityBadgeStatus(quantity)} />
                      <Text type={isEmpty ? "danger" : undefined}>
                        {t("products.catalogVariant.inStock", {
                          count: quantity,
                        })}
                      </Text>
                    </Flex>
                  );
                },
              },
            ]
          : []),
      {
        title: t("products.table.actions"),
        key: "actions",
        dataIndex: "actions",
        width: 128,
        fixed: "right",
        render: (_: unknown, record: ProductVariantUi) => {
          const isPersisted = record.id != null;
          const isArchived = isArchivedStatus(record.status);
          const archiveLabel = isArchived
            ? t("products.unarchive")
            : t("products.archive");
          const isDeleting =
            deletingVariantKey === record.key ||
            (record.id != null && deleteLoadingVariantId === record.id);

          return (
            <Flex align="center" gap={0} style={{ flexWrap: "nowrap" }}>
              {showInventoryManagement && isPersisted && onOpenInventory && (
                <Tooltip
                  title={
                    isArchived
                      ? t("products.inventoryDrawer.archivedVariantTooltip")
                      : t("products.inventoryDrawer.openVariantStockAria")
                  }
                >
                  <span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CubeIcon size={16} />}
                      disabled={isArchived}
                      aria-label={
                        isArchived
                          ? t("products.inventoryDrawer.archivedVariantTooltip")
                          : t("products.inventoryDrawer.openVariantStockAria")
                      }
                      onClick={() => onOpenInventory(record)}
                    />
                  </span>
                </Tooltip>
              )}
              {isPersisted &&
                ((isArchived && onUnarchiveVariant) ||
                  (!isArchived && onArchiveVariant)) && (
                  <Tooltip title={archiveLabel}>
                    <Button
                      type="text"
                      size="small"
                      loading={archiveLoadingVariantId === record.id}
                      icon={
                        isArchived ? (
                          <ArrowClockwiseIcon size={16} />
                        ) : (
                          <ArchiveIcon size={16} />
                        )
                      }
                      aria-label={archiveLabel}
                      onClick={() =>
                        isArchived
                          ? onUnarchiveVariant?.(record)
                          : onArchiveVariant?.(record)
                      }
                    />
                  </Tooltip>
                )}
              <Tooltip title={t("products.delete")}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<TrashIcon size={16} />}
                  loading={isDeleting}
                  disabled={
                    deletingVariantKey != null || deleteLoadingVariantId != null
                  }
                  aria-label={t("products.delete")}
                  onClick={() => onDeleteVariant(record)}
                />
              </Tooltip>
            </Flex>
          );
        },
      },
    ];
  }, [
    archiveLoadingVariantId,
    availableFields,
    currencySymbol,
    deleteLoadingVariantId,
    deletingVariantKey,
    onArchiveVariant,
    onDeleteVariant,
    onManageVariantImages,
    onOpenInventory,
    onUnarchiveVariant,
    onUpdateManualVariantCustomField,
    selectedCharacteristics,
    showInventoryManagement,
    showPurchasePriceColumn,
    showQuantityColumn,
    t,
  ]);
}
