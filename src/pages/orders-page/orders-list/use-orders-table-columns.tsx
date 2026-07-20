import type { TableColumnsType } from "antd";
import { Flex, Tooltip, Typography, Tag } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getClientDetailsPath } from "@/app/router/pages-map";
import { DeliveryStatusTag } from "@/features/orders/components/order-delivery-status";
import { OrderPaymentStatusLabel } from "@/features/orders/components/order-payment-status";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { formatDateTime } from "@/utils/date-time";

import {
  formatOrderCustomerName,
  formatOrderListSource,
} from "./order-list-display.utils";
import { OrderListManagerCell } from "./order-list-manager-cell";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

const { Text, Link } = Typography;

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
        width: 70,
        fixed: "left",
        render: (_, order) => <Text>#{order.id}</Text>,
      },
      {
        title: t("orders.table.customer"),
        key: "customer",
        ellipsis: true,
        render: (_, order) => (
          <Flex align="center" justify="space-between">
            {formatOrderCustomerName(order)}
            <Tooltip title={t("orders.table.seeClientOrders")}>
              <Link
                href={getClientDetailsPath(order.customerId)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("orders.table.seeClientOrders")}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <ArrowUpRightIcon size={16} />
              </Link>
            </Tooltip>
          </Flex>
        ),
      },
      {
        title: t("orders.table.source"),
        dataIndex: "source",
        key: "source",
        width: 100,
        render: (_, order) => <Tag>{formatOrderListSource(order, t)}</Tag>,
      },
      {
        title: t("orders.table.total"),
        key: "total",
        width: 100,
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
        title: t("orders.table.paymentStatus"),
        key: "paymentStatus",
        width: 140,
        render: (_, order) => (
          <OrderPaymentStatusLabel status={order.payment.status} />
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
        title: t("orders.table.delivery"),
        key: "delivery",
        width: 160,
        ellipsis: true,
        render: (_, order) => (
          <DeliveryStatusTag value={order.delivery?.deliveryStatus} />
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
