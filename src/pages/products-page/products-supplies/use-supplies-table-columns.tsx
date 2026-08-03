import type { TableColumnsType } from "antd";
import { Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { StockSupplyListItem } from "@/features/inventory/model/inventory.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatQuantityChange } from "@/features/products/components/product-inventory-drawer/product-inventory-movements-history/product-inventory-movements-history.utils";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import { formatSupplyDateTime } from "./products-supplies.utils";
import { SupplyStatusTag } from "./supply-status-tag";

const { Text } = Typography;

export const useSuppliesTableColumns =
  (): TableColumnsType<StockSupplyListItem> => {
    const { t } = useTranslation();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const currency = workspaceSettingsStore.currency ?? "UAH";

    return useMemo(
      () => [
        {
          title: t("products.supplies.table.name"),
          dataIndex: "name",
          key: "name",
          ellipsis: true,
          render: (value: string) => <Text strong>{value}</Text>,
        },
        {
          title: t("products.supplies.table.createdAt"),
          dataIndex: "createdAt",
          key: "createdAt",
          width: 160,
          render: (value: string) => (
            <Text type="secondary">{formatSupplyDateTime(value)}</Text>
          ),
        },
        {
          title: t("products.supplies.table.manager"),
          key: "createdBy",
          width: 180,
          ellipsis: true,
          render: (_, item) => (
            <Text type="secondary" ellipsis>
              {item.createdBy?.name?.trim() || "—"}
            </Text>
          ),
        },
        {
          title: t("products.supplies.table.positions"),
          dataIndex: "positionsCount",
          key: "positionsCount",
          width: 100,
          align: "right",
        },
        {
          title: t("products.supplies.table.units"),
          dataIndex: "totalQuantity",
          key: "totalQuantity",
          width: 110,
          align: "right",
          render: (value: number) => (
            <Text type="success" strong>
              {formatQuantityChange(value)}
            </Text>
          ),
        },
        {
          title: t("products.supplies.table.sum"),
          dataIndex: "totalSum",
          key: "totalSum",
          width: 130,
          align: "right",
          render: (value: number) => (
            <Text>{formatMoney(value, currency)}</Text>
          ),
        },
        {
          title: t("products.supplies.table.status"),
          dataIndex: "status",
          key: "status",
          width: 150,
          align: "center",
          render: (status: StockSupplyListItem["status"]) => (
            <SupplyStatusTag status={status} />
          ),
        },
        {
          title: t("products.supplies.table.appliedAt"),
          dataIndex: "appliedAt",
          key: "appliedAt",
          width: 160,
          align: "right",
          render: (value: string | null) => (
            <Text type="secondary">{formatSupplyDateTime(value)}</Text>
          ),
        },
      ],
      [currency, t],
    );
  };
