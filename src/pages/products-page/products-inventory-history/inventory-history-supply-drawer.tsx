import { InfoIcon } from "@phosphor-icons/react";
import {
  Alert,
  Drawer,
  Flex,
  Table,
  Typography,
  theme,
  type TableColumnsType,
} from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  InventoryHistorySupplyItem,
  InventoryHistorySupplyLine,
} from "@/features/inventory/model/inventory.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import {
  formatQuantityChange,
  getMovementTitle,
} from "@/features/products/components/product-inventory-drawer/product-inventory-movements-history/product-inventory-movements-history.utils";
import { formatNumber } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer.utils";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import {
  formatInventoryHistoryDate,
  formatInventoryHistoryTime,
  formatInventoryHistoryVariantLabel,
} from "./products-inventory-history.utils";

const { Title, Text } = Typography;

type InventoryHistorySupplyDrawerProps = {
  open: boolean;
  item: InventoryHistorySupplyItem | null;
  onClose: () => void;
  /** Hide stock before/after when data is not available (e.g. supplies list). */
  hideStockColumn?: boolean;
};

function getSupplyTotalCost(item: InventoryHistorySupplyItem): number | null {
  if (item.totalPurchaseCost != null) {
    return item.totalPurchaseCost;
  }

  const computed = item.items.reduce((sum, line) => {
    if (line.purchasePrice == null) {
      return sum;
    }

    return sum + line.purchasePrice * line.quantityChange;
  }, 0);

  return computed > 0 ? computed : null;
}

export const InventoryHistorySupplyDrawer = ({
  open,
  item,
  onClose,
  hideStockColumn = false,
}: InventoryHistorySupplyDrawerProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const isMobileViewport = useIsMobileViewport();
  const currency = useWorkspaceSettingsStore().currency ?? "UAH";

  const columns = useMemo<TableColumnsType<InventoryHistorySupplyLine>>(() => {
    const nextColumns: TableColumnsType<InventoryHistorySupplyLine> = [
      {
        title: t("products.inventoryHistory.drawer.productVariant"),
        key: "productVariant",
        ellipsis: true,
        render: (_, line) => (
          <Flex vertical gap={2}>
            <Text strong>{line.productName}</Text>
            <Text type="secondary">
              {formatInventoryHistoryVariantLabel(line.variantName, line.sku)}
            </Text>
          </Flex>
        ),
      },
      {
        title: t("products.inventoryHistory.drawer.quantity"),
        dataIndex: "quantityChange",
        key: "quantityChange",
        width: 80,
        render: (value: number) => (
          <Text strong style={{ color: token.colorSuccess }}>
            {formatQuantityChange(value)}
          </Text>
        ),
      },
    ];

    if (!hideStockColumn) {
      nextColumns.push({
        title: t("products.inventoryHistory.drawer.stock"),
        key: "stock",
        width: 110,
        render: (_, line) => (
          <>
            <Text type="secondary">{formatNumber(line.stockBefore)}</Text> →{" "}
            <Text strong>{formatNumber(line.stockAfter)}</Text>
          </>
        ),
      });
    }

    nextColumns.push({
      title: t("products.inventoryHistory.drawer.price"),
      key: "price",
      width: 90,
      render: (_, line) => (
        <Text>
          {line.purchasePrice != null
            ? formatMoney(line.purchasePrice, currency)
            : "—"}
        </Text>
      ),
    });

    return nextColumns;
  }, [currency, hideStockColumn, t, token.colorSuccess]);

  if (!item) {
    return null;
  }

  const totalCost = getSupplyTotalCost(item);
  const supplyName = item.name?.trim() || "";
  const title = supplyName
    ? `${getMovementTitle(item.type, t)} - ${supplyName}`
    : getMovementTitle(item.type, t);
  const meta = [
    formatInventoryHistoryDate(item.createdAt),
    formatInventoryHistoryTime(item.createdAt),
    item.user?.name?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  const summaryCardStyle = {
    flex: 1,
    minWidth: 0,
    padding: 14,
    borderRadius: token.borderRadiusLG,
    background: token.colorFillAlter,
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={isMobileViewport ? "100%" : 560}
      destroyOnHidden
      title={
        <Flex vertical gap={2}>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {meta ? <Text type="secondary">{meta}</Text> : null}
        </Flex>
      }
      data-qa="products-inventory-history-supply-drawer"
    >
      <Flex vertical gap={16}>
        {item.comment?.trim() && (
          <Alert
            type="info"
            showIcon
            icon={<InfoIcon size={18} />}
            title={item.comment}
          />
        )}

        <Flex gap={12}>
          <Flex vertical gap={4} style={summaryCardStyle}>
            <Text type="secondary">
              {t("products.inventoryHistory.drawer.positions")}
            </Text>
            <Title level={3} style={{ margin: 0 }}>
              {formatNumber(item.itemsCount)}
            </Title>
          </Flex>

          <Flex vertical gap={4} style={summaryCardStyle}>
            <Text type="secondary">
              {t("products.inventoryHistory.drawer.units")}
            </Text>
            <Title level={3} style={{ margin: 0, color: token.colorSuccess }}>
              {formatQuantityChange(item.totalQuantityChange)}{" "}
              {t("products.inventoryDrawer.unit")}
            </Title>
          </Flex>

          <Flex vertical gap={4} style={summaryCardStyle}>
            <Text type="secondary">
              {t("products.inventoryHistory.drawer.purchaseTotal")}
            </Text>
            <Title level={3} style={{ margin: 0 }}>
              {totalCost != null ? formatMoney(totalCost, currency) : "—"}
            </Title>
          </Flex>
        </Flex>

        <Table
          rowKey="variantId"
          columns={columns}
          dataSource={item.items}
          pagination={false}
          size="small"
        />
      </Flex>
    </Drawer>
  );
};
