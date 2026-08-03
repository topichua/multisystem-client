import { Card, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { StockSupplyListItem } from "@/features/inventory/model/inventory.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatQuantityChange } from "@/features/products/components/product-inventory-drawer/product-inventory-movements-history/product-inventory-movements-history.utils";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import { formatSupplyDateTime } from "./products-supplies.utils";
import { SupplyStatusTag } from "./supply-status-tag";

const { Text } = Typography;

type SuppliesMobileCardProps = {
  item: StockSupplyListItem;
  onOpenSupply: (item: StockSupplyListItem) => void;
};

export const SuppliesMobileCard = ({
  item,
  onOpenSupply,
}: SuppliesMobileCardProps) => {
  const { t } = useTranslation();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const currency = workspaceSettingsStore.currency ?? "UAH";

  return (
    <Card
      size="small"
      hoverable
      data-qa={`products-mobile-supplies-item-${item.id}`}
      styles={{ body: { cursor: "pointer" } }}
      onClick={() => onOpenSupply(item)}
    >
      <Flex vertical gap={10}>
        <Flex justify="space-between" align="flex-start" gap={8}>
          <Text strong style={{ minWidth: 0 }}>
            {item.name}
          </Text>
          <SupplyStatusTag status={item.status} style={{ flexShrink: 0 }} />
        </Flex>

        <Flex justify="space-between" gap={8} wrap="wrap">
          <Text type="secondary">
            {t("products.supplies.table.createdAt")}:{" "}
            {formatSupplyDateTime(item.createdAt)}
          </Text>
          <Text type="secondary">{item.createdBy?.name?.trim() || "—"}</Text>
        </Flex>

        <Flex justify="space-between" align="center" gap={8} wrap="wrap">
          <Text>
            {t("products.supplies.mobile.positions", {
              count: item.positionsCount,
            })}
          </Text>
          <Text type="success" strong>
            {formatQuantityChange(item.totalQuantity)}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" gap={8} wrap="wrap">
          <Text>{formatMoney(item.totalSum, currency)}</Text>
          <Text type="secondary">
            {t("products.supplies.table.appliedAt")}:{" "}
            {formatSupplyDateTime(item.appliedAt)}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};
