import { ArrowUpRightIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getOrderDetailsPath } from "@/app/router/pages-map";
import { Tag as OrderStatusTag } from "@/components/tag/tag";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { formatClientDate } from "../../clients-list/client-display.utils";

const { Text, Title } = Typography;

type ClientDetailsOrdersSectionProps = {
  orders: OrderListItem[];
  orderCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

function getOrderItemsCount(order: OrderListItem): string {
  return typeof order.itemsCount === "number" ? String(order.itemsCount) : "—";
}

export function ClientDetailsOrdersSection({
  orders,
  orderCount,
  loading,
  error,
  onRetry,
}: ClientDetailsOrdersSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobileViewport = useIsMobileViewport();

  const columns = useMemo(
    () => [
      {
        title: t("clients.details.ordersTable.number"),
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (_: unknown, order: OrderListItem) => <Text>#{order.id}</Text>,
      },
      {
        title: t("clients.details.ordersTable.date"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 130,
        render: (value: string) => formatClientDate(value),
      },
      {
        title: t("clients.details.ordersTable.positions"),
        key: "itemsCount",
        width: 110,
        align: "center" as const,
        render: (_: unknown, order: OrderListItem) => getOrderItemsCount(order),
      },
      {
        title: t("clients.details.ordersTable.total"),
        key: "total",
        width: 140,
        render: (_: unknown, order: OrderListItem) => (
          <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>
        ),
      },
      {
        title: t("clients.details.ordersTable.status"),
        key: "status",
        width: 180,
        render: (_: unknown, order: OrderListItem) => (
          <OrderStatusTag color={order.status.color}>
            {order.status.name}
          </OrderStatusTag>
        ),
      },
      {
        key: "action",
        width: 56,
        align: "center" as const,
        render: (_: unknown, order: OrderListItem) => (
          <Button
            type="text"
            size="small"
            icon={<ArrowUpRightIcon size={16} />}
            aria-label={t("clients.details.openOrderAria", { id: order.id })}
            onClick={() => navigate(getOrderDetailsPath(order.id))}
          />
        ),
      },
    ],
    [navigate, t],
  );

  function renderLoadingState() {
    if (!isMobileViewport) {
      return (
        <Table<OrderListItem>
          rowKey="id"
          columns={columns}
          dataSource={[]}
          pagination={false}
          loading
          scroll={{ x: "max-content" }}
        />
      );
    }

    return (
      <Flex vertical gap={12}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="small">
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </Flex>
    );
  }

  function renderOrdersContent() {
    if (loading) {
      return renderLoadingState();
    }

    if (orders.length === 0) {
      if (error) {
        return null;
      }

      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("clients.details.emptyOrders")}
        />
      );
    }

    if (isMobileViewport) {
      return (
        <Flex vertical gap={12}>
          {orders.map((order) => (
            <Card
              key={order.id}
              size="small"
              hoverable
              data-qa={`clients-mobile-order-${order.id}`}
              onClick={() => navigate(getOrderDetailsPath(order.id))}
            >
              <Flex justify="space-between" align="center" gap={8}>
                <Text strong>#{order.id}</Text>
                <Text type="secondary">
                  {formatClientDate(order.createdAt)}
                </Text>
              </Flex>

              <Flex
                justify="space-between"
                align="center"
                gap={8}
                style={{ marginTop: 8 }}
              >
                <OrderStatusTag color={order.status.color}>
                  {order.status.name}
                </OrderStatusTag>
                <Text strong>
                  {formatMoney(order.totalAmount, order.currency)}
                </Text>
              </Flex>

              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                {t("clients.details.ordersTable.positions")}:{" "}
                {getOrderItemsCount(order)}
              </Text>
            </Card>
          ))}
        </Flex>
      );
    }

    return (
      <Table<OrderListItem>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    );
  }

  return (
    <Flex vertical gap={12} style={{ marginTop: 24 }}>
      <Space align="center">
        <Title level={4} style={{ margin: 0 }}>
          {t("clients.details.ordersTitle")}
        </Title>
        <Tag style={{ marginInlineEnd: 0 }}>{orderCount}</Tag>
      </Space>

      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          action={
            <Button size="small" onClick={onRetry}>
              {t("clients.details.retry")}
            </Button>
          }
        />
      ) : null}

      {renderOrdersContent()}
    </Flex>
  );
}
