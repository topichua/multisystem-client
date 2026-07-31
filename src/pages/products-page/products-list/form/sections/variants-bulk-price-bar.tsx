import { CubeIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Form, InputNumber, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { getStockQuantityBadgeStatus } from "@/features/products/utils/product-display";

import type { ProductAddFormValues } from "../product-form.types";
import type { ProductVariantUi } from "../variants/product-add-variant.types";
import { mergeProductVariantsWithFormValues } from "../variants/product-add-variant.utils";

const { Title, Text } = Typography;

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
};

type VariantsBulkPriceBarProps = {
  productVariants: ProductVariantUi[];
  disabled?: boolean;
  onApplyPriceToAll: (price: number) => void;
  showInventorySummary?: boolean;
  showInventoryManagement?: boolean;
  onOpenInventory?: () => void;
  isMobile?: boolean;
};

export function VariantsBulkPriceBar({
  productVariants,
  disabled = false,
  onApplyPriceToAll,
  showInventorySummary = false,
  showInventoryManagement = false,
  onOpenInventory,
  isMobile = false,
}: VariantsBulkPriceBarProps) {
  const { t } = useTranslation();
  const form = Form.useFormInstance<ProductAddFormValues>();
  const watchedVariants = Form.useWatch("variants", form);
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const [bulkPrice, setBulkPrice] = useState<number | null>(null);

  const totalQuantity = useMemo(() => {
    return mergeProductVariantsWithFormValues(
      productVariants,
      watchedVariants,
    ).reduce((sum, variant) => sum + Number(variant.quantity ?? 0), 0);
  }, [productVariants, watchedVariants]);

  const stockBadgeStatus = getStockQuantityBadgeStatus(totalQuantity);
  const handleApply = () => {
    if (bulkPrice == null || bulkPrice < 0) {
      return;
    }

    onApplyPriceToAll(bulkPrice);
  };

  const inventoryControls =
    showInventorySummary || (showInventoryManagement && onOpenInventory) ? (
      <Flex align="center" gap={12} wrap="wrap">
        {showInventorySummary && (
          <Flex align="center" gap={6}>
            <Badge status={stockBadgeStatus} />
            <Text
              type={stockBadgeStatus === "error" ? "danger" : undefined}
              strong={stockBadgeStatus === "error"}
            >
              {t("products.variantsForm.totalStock", {
                count: totalQuantity,
              })}
            </Text>
          </Flex>
        )}

        {showInventoryManagement && onOpenInventory && (
          <Button
            type="text"
            icon={<CubeIcon size={16} />}
            onClick={onOpenInventory}
            aria-label={t("products.variantsForm.manageInventory")}
            style={{ fontWeight: 500, paddingInline: 4 }}
          >
            {t("products.variantsForm.manageInventory")}
          </Button>
        )}
      </Flex>
    ) : null;

  const bulkPriceControls = (
    <Flex
      align="center"
      gap={8}
      style={isMobile ? { width: "100%" } : undefined}
    >
      <InputNumber
        min={0}
        value={bulkPrice}
        placeholder={t("products.variantsForm.bulkPricePlaceholder")}
        addonAfter={currencySymbol}
        onChange={(value) => setBulkPrice(value)}
        disabled={disabled}
        style={{
          width: isMobile ? "100%" : 160,
          flex: isMobile ? 1 : undefined,
        }}
      />

      <Button
        type="text"
        onClick={handleApply}
        disabled={disabled || bulkPrice == null || bulkPrice < 0}
        style={{ fontWeight: 600, flexShrink: 0 }}
      >
        {t("products.variantsForm.applyPriceToAll")}
      </Button>
    </Flex>
  );

  if (isMobile) {
    return (
      <Flex vertical gap={12}>
        <Text type="secondary">
          {t("products.variantsForm.editSkuAndPriceHint")}
        </Text>
        {inventoryControls}
        {bulkPriceControls}
      </Flex>
    );
  }

  return (
    <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
      <Flex vertical gap={4} style={{ minWidth: 0 }}>
        <Title level={5} style={{ margin: 0 }}>
          {t("products.variantsForm.variants")}{" "}
          <Text type="secondary" style={{ fontSize: 14 }}>
            {productVariants.length}
          </Text>
        </Title>
        <Text type="secondary">
          {t("products.variantsForm.editSkuAndPriceHint")}
        </Text>
      </Flex>

      <Flex align="center" gap={16} wrap="wrap">
        {inventoryControls}
        {bulkPriceControls}
      </Flex>
    </Flex>
  );
}
