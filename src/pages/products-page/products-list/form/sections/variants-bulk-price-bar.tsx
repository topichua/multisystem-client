import { Button, Flex, InputNumber, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

const { Text } = Typography;

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
};

type VariantsBulkPriceBarProps = {
  disabled?: boolean;
  onApplyPriceToAll: (price: number) => void;
  isMobile?: boolean;
};

export function VariantsBulkPriceBar({
  disabled = false,
  onApplyPriceToAll,
  isMobile = false,
}: VariantsBulkPriceBarProps) {
  const { t } = useTranslation();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const [bulkPrice, setBulkPrice] = useState<number | null>(null);

  const handleApply = () => {
    if (bulkPrice == null || bulkPrice < 0) {
      return;
    }

    onApplyPriceToAll(bulkPrice);
  };

  return (
    <Flex
      align={isMobile ? "stretch" : "center"}
      justify="space-between"
      gap={12}
      wrap={isMobile ? "wrap" : undefined}
      vertical={isMobile}
    >
      <Text type="secondary">
        {t("products.variantsForm.editSkuAndPriceHint")}
      </Text>

      <Flex
        align="center"
        gap={8}
        style={isMobile ? { width: "100%" } : undefined}
      >
        <InputNumber
          min={0}
          value={bulkPrice}
          placeholder={t("products.variantsForm.bulkPricePlaceholder", {
            currency: currencySymbol,
          })}
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
    </Flex>
  );
}
