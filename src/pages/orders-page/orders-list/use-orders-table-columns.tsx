import type { TableColumnsType } from "antd";
import { Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getClientDetailsPath } from "@/app/router/pages-map";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { formatDateTime } from "@/utils/date-time";

import {
  formatOrderCustomerName,
  formatOrderListDelivery,
  formatOrderListSource,
} from "./order-list-display.utils";
import { OrderListManagerCell } from "./order-list-manager-cell";

const { Text } = Typography;

type UseOrdersTableColumnsParams = {
  members: WorkspaceMember[];
};

export function useOrdersTableColumns({
  members,
}: UseOrdersTableColumnsParams): TableColumnsType<OrderListItem> {
  const { t } = useTranslation();

  return useMemo(() => {
    const memberByUserId = new Map(
      members.map((member) => [member.user.id, member]),
    );

    return [
      {
        title: t("orders.table.id"),
        dataIndex: "id",
        key: "id",
        width: 90,
        fixed: "left",
        render: (_, order) => <Text>#{order.id}</Text>,
      },
      {
        title: t("orders.table.customer"),
        key: "customer",
        width: 180,
        ellipsis: true,
        render: (_, order) => (
          <Typography.Link
            href={getClientDetailsPath(order.customerId)}
            target="_blank"
            rel="noopener noreferrer"
            ellipsis
            aria-label={t("orders.table.openClientAria", {
              name: formatOrderCustomerName(order),
            })}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            style={{ display: "block", minWidth: 0 }}
          >
            {formatOrderCustomerName(order)}
          </Typography.Link>
        ),
      },
      {
        title: t("orders.table.source"),
        dataIndex: "source",
        key: "source",
        width: 120,
        render: (_, order) => (
          <Tag color="blue">{formatOrderListSource(order, t)}</Tag>
        ),
      },
      {
        title: t("orders.table.total"),
        key: "total",
        width: 130,
        render: (_, order) => (
          <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>
        ),
      },
      {
        title: t("orders.table.status"),
        key: "status",
        width: 180,
        render: (_, order) => (
          <span
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <OrderStatusSelect
              variant="borderless"
              orderId={order.id}
              statusId={order.statusId}
            />
          </span>
        ),
      },
      {
        title: t("orders.table.manager"),
        key: "manager",
        width: 180,
        render: (_, order) => (
          <OrderListManagerCell order={order} memberByUserId={memberByUserId} />
        ),
      },
      {
        title: t("orders.table.note"),
        dataIndex: "internalNote",
        key: "internalNote",
        width: 180,
        ellipsis: true,
        render: (value: string | null) => value?.trim() || "—",
      },
      {
        title: t("orders.table.delivery"),
        key: "delivery",
        width: 160,
        ellipsis: true,
        render: (_, order) => (
          <Text ellipsis>{formatOrderListDelivery(order, t)}</Text>
        ),
      },
      {
        title: t("orders.table.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value: string) => formatDateTime(value),
      },
    ];
  }, [members, t]);
}
