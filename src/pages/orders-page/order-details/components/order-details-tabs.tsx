import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Row,
  Tabs,
  Timeline,
  Typography,
} from "antd";
import type { DescriptionsProps, TabsProps, TimelineProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";

import {
  EMPTY_VALUE,
  formatDate,
  formatMoney,
  formatText,
  getCustomerInitials,
  getCustomerName,
  getEventDescription,
} from "../utils/order-details.utils";
import { DeliveryStatusTag, PaymentStatusTag } from "./order-status-tags";
import { OrderProductsTable } from "./order-products-table";

const { Text, Paragraph } = Typography;

type OrderDetailsTabsProps = {
  order: OrderDetails;
};

export const OrderDetailsTabs = ({ order }: OrderDetailsTabsProps) => {
  const { t } = useTranslation();

  const orderItems = order.items;
  const deliveryInfos = order.deliveryInfos ?? [];
  const primaryDeliveryInfo = deliveryInfos[0];

  const getSourceLabel = (source: string | null | undefined): string =>
    source
      ? t(`orders.sources.${source}`, { defaultValue: source })
      : EMPTY_VALUE;

  const getDeliveryProviderLabel = (
    provider: string | null | undefined,
  ): string =>
    provider
      ? t(`orders.deliveryProviders.${provider}`, { defaultValue: provider })
      : EMPTY_VALUE;

  const sortedEvents = useMemo(
    () =>
      [...order.events].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [order.events],
  );

  const historyItems = useMemo<TimelineProps["items"]>(
    () =>
      sortedEvents.map((event) => ({
        key: event.id,
        label: formatDate(event.createdAt),
        children: (
          <Flex vertical gap={2}>
            <Text>
              {getEventDescription(event, order.items, order.currency, t)}
            </Text>

            <Text type="secondary">
              {t("orders.actor")} #{event.actorId}
            </Text>
          </Flex>
        ),
      })),
    [order.currency, order.items, sortedEvents, t],
  );

  const orderInfoItems: DescriptionsProps["items"] = [
    {
      key: "id",
      label: t("orders.orderId"),
      children: order.id,
    },
    {
      key: "createdAt",
      label: t("orders.createdAt"),
      children: formatDate(order.createdAt),
    },
    {
      key: "source",
      label: t("orders.source"),
      children: getSourceLabel(order.source),
    },
    {
      key: "currency",
      label: t("orders.currency"),
      children: order.currency,
    },
  ];

  const paymentInfoItems: DescriptionsProps["items"] = [
    {
      key: "paymentStatus",
      label: t("orders.paymentStatusLabel"),
      children: <PaymentStatusTag value={order.paymentStatus} />,
    },
    {
      key: "paidAt",
      label: t("orders.paidAt"),
      children: formatDate(order.paidAt),
    },
    {
      key: "paymentReference",
      label: t("orders.paymentReference"),
      children: formatText(order.paymentReference),
    },
  ];

  const deliveryInfoItems: DescriptionsProps["items"] = [
    {
      key: "deliveryStatus",
      label: t("orders.deliveryStatusLabel"),
      children: <DeliveryStatusTag value={order.deliveryStatus} />,
    },
    {
      key: "provider",
      label: t("orders.deliveryProvider"),
      children: getDeliveryProviderLabel(primaryDeliveryInfo?.provider),
    },
    {
      key: "recipientName",
      label: t("orders.recipientName"),
      children: formatText(primaryDeliveryInfo?.recipientName),
    },
    {
      key: "phone",
      label: t("orders.phone"),
      children: primaryDeliveryInfo?.phone ? (
        <Typography.Link href={`tel:${primaryDeliveryInfo.phone}`}>
          {primaryDeliveryInfo.phone}
        </Typography.Link>
      ) : (
        EMPTY_VALUE
      ),
    },
    {
      key: "city",
      label: t("orders.city"),
      children: formatText(primaryDeliveryInfo?.city),
    },
    {
      key: "warehouse",
      label: t("orders.warehouse"),
      children: formatText(primaryDeliveryInfo?.warehouse),
    },
    {
      key: "address",
      label: t("orders.address"),
      children: formatText(primaryDeliveryInfo?.address),
    },
    {
      key: "trackingNumber",
      label: t("orders.trackingNumber"),
      children: primaryDeliveryInfo?.trackingNumber ? (
        <Text copyable>{primaryDeliveryInfo.trackingNumber}</Text>
      ) : (
        EMPTY_VALUE
      ),
    },
  ];

  const customerInfoItems: DescriptionsProps["items"] = [
    {
      key: "customerId",
      label: t("orders.customerId"),
      children: order.customer.id,
    },
    {
      key: "phone",
      label: t("orders.phone"),
      children: order.customer.phone ? (
        <Typography.Link href={`tel:${order.customer.phone}`}>
          {order.customer.phone}
        </Typography.Link>
      ) : (
        EMPTY_VALUE
      ),
    },
    {
      key: "instagramUserId",
      label: t("orders.instagramUserId"),
      children: formatText(order.customer.instagramUserId),
    },
    {
      key: "deliveryInfo",
      label: t("orders.savedDeliveryInfo"),
      children: formatText(order.customer.deliveryInfo),
    },
    {
      key: "createdAt",
      label: t("orders.customerCreatedAt"),
      children: formatDate(order.customer.createdAt),
    },
  ];

  const totalsInfoItems: DescriptionsProps["items"] = [
    {
      key: "subtotalAmount",
      label: t("orders.subtotal"),
      children: formatMoney(order.subtotalAmount, order.currency),
    },
    {
      key: "discountAmount",
      label: t("orders.discount"),
      children: formatMoney(order.discountAmount, order.currency),
    },
    {
      key: "deliveryAmount",
      label: t("orders.deliveryAmount"),
      children: formatMoney(order.deliveryAmount, order.currency),
    },
    {
      key: "totalAmount",
      label: <Text strong>{t("orders.total")}</Text>,
      children: (
        <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>
      ),
    },
  ];

  const tabs: TabsProps["items"] = [
    {
      key: "overview",
      label: t("orders.overview"),
      children: (
        <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
          <Col xs={24} xl={16}>
            <Flex vertical gap={16}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card size="small" title={t("orders.orderInfo")}>
                    <Descriptions
                      size="small"
                      column={1}
                      items={orderInfoItems}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card size="small" title={t("orders.delivery")}>
                    <Descriptions
                      size="small"
                      column={1}
                      items={deliveryInfoItems}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card size="small" title={t("orders.payment")}>
                    <Descriptions
                      size="small"
                      column={1}
                      items={paymentInfoItems}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card size="small" title={t("orders.source")}>
                    <Descriptions
                      size="small"
                      column={1}
                      items={[
                        {
                          key: "source",
                          label: t("orders.source"),
                          children: getSourceLabel(order.source),
                        },
                        {
                          key: "conversationId",
                          label: t("orders.conversationId"),
                          children: formatText(order.conversationId),
                        },
                        {
                          key: "conversationUpdatedAt",
                          label: t("orders.conversationUpdatedAt"),
                          children: formatDate(
                            order.conversation?.instUpdatedAt,
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>

              <Card
                size="small"
                title={t("orders.products", { count: orderItems.length })}
              >
                <OrderProductsTable
                  items={orderItems}
                  currency={order.currency}
                />

                <Divider />

                <Descriptions size="small" column={1} items={totalsInfoItems} />
              </Card>
            </Flex>
          </Col>

          <Col xs={24} xl={8}>
            <Flex vertical gap={16}>
              <Card size="small" title={t("orders.customer")}>
                <Flex align="center" gap={12}>
                  <Avatar size={48}>
                    {getCustomerInitials(order.customer)}
                  </Avatar>

                  <Flex vertical>
                    <Text strong>{getCustomerName(order.customer)}</Text>
                    <Text type="secondary">{getSourceLabel(order.source)}</Text>
                  </Flex>
                </Flex>

                <Divider />

                <Descriptions
                  size="small"
                  column={1}
                  items={customerInfoItems}
                />
              </Card>

              <Card size="small" title={t("orders.notes")}>
                {!order.customerNote && !order.internalNote ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("orders.noNotes")}
                  />
                ) : (
                  <Flex vertical gap={12}>
                    <div>
                      <Text type="secondary">{t("orders.customerNote")}</Text>
                      <Paragraph>{formatText(order.customerNote)}</Paragraph>
                    </div>

                    <div>
                      <Text type="secondary">{t("orders.internalNote")}</Text>
                      <Paragraph>{formatText(order.internalNote)}</Paragraph>
                    </div>
                  </Flex>
                )}
              </Card>

              <Card size="small" title={t("orders.history")}>
                {historyItems?.length ? (
                  <Timeline items={historyItems.slice(-5)} />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("orders.noHistory")}
                  />
                )}
              </Card>
            </Flex>
          </Col>
        </Row>
      ),
    },
    {
      key: "products",
      label: t("orders.productsTab"),
      children: (
        <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
          <Col xs={24} xl={16}>
            <Card size="small">
              <OrderProductsTable
                items={orderItems}
                currency={order.currency}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card size="small" title={t("orders.total")}>
              <Descriptions size="small" column={1} items={totalsInfoItems} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "customer",
      label: t("orders.customerTab"),
      children: (
        <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
          <Col xs={24} xl={12}>
            <Card size="small" title={t("orders.customer")}>
              <Flex align="center" gap={12}>
                <Avatar size={48}>{getCustomerInitials(order.customer)}</Avatar>

                <Flex vertical>
                  <Text strong>{getCustomerName(order.customer)}</Text>
                  <Text type="secondary">{getSourceLabel(order.source)}</Text>
                </Flex>
              </Flex>

              <Divider />

              <Descriptions size="small" column={1} items={customerInfoItems} />
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card size="small" title={t("orders.conversation")}>
              <Descriptions
                size="small"
                column={1}
                items={[
                  {
                    key: "conversationId",
                    label: t("orders.conversationId"),
                    children: formatText(order.conversation?.id),
                  },
                  {
                    key: "source",
                    label: t("orders.source"),
                    children: getSourceLabel(order.source),
                  },
                  {
                    key: "groupId",
                    label: t("orders.groupId"),
                    children: formatText(order.conversation?.groupId),
                  },
                  {
                    key: "managerId",
                    label: t("orders.managerId"),
                    children: formatText(order.conversation?.managerId),
                  },
                  {
                    key: "readAt",
                    label: t("orders.readAt"),
                    children: formatDate(order.conversation?.readAt),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "history",
      label: t("orders.historyTab"),
      children: (
        <Card size="small">
          {historyItems?.length ? (
            <Timeline mode="left" items={historyItems} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("orders.noHistory")}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <Flex vertical gap={16} style={{ paddingTop: 8 }}>
      <Tabs items={tabs} />
    </Flex>
  );
};
