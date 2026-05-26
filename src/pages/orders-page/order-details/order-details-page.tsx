import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type {
  DescriptionsProps,
  TableProps,
  TabsProps,
  TimelineProps,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { GroupColoredNameTag } from "@/features/conversation-groups/components/group-select-visuals";
import { ordersApi } from "@/features/orders/api/orders-api";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderDetails } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

const { Text, Paragraph } = Typography;

type OrderItem = OrderDetails["items"][number];
type OrderEvent = OrderDetails["events"][number];

type JsonRecord = Record<string, unknown>;

const EMPTY_VALUE = "—";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "green",
  unpaid: "gold",
  refunded: "purple",
  cancelled: "red",
  canceled: "red",
};

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  pending: "blue",
  shipped: "processing",
  delivered: "green",
  cancelled: "red",
  canceled: "red",
};

const coerceOrderId = (value: string | undefined): number | null => {
  if (!value) return null;

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getRecordNumber = (record: JsonRecord, key: string): number | null => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const formatText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;

  return String(value);
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", "");
};

const formatMoney = (
  value: number | null | undefined,
  currency = "UAH",
): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return EMPTY_VALUE;

  try {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("uk-UA")} ${currency}`;
  }
};

const getEventDescription = (
  event: OrderEvent,
  orderItems: OrderItem[],
  currency: string,
  translate: (key: string, options?: Record<string, unknown>) => string,
): string => {
  const payload = isRecord(event.payload) ? event.payload : {};

  switch (event.type) {
    case "order.created":
      return translate("orders.events.created");

    case "order.item_added": {
      const orderItemId = getRecordNumber(payload, "orderItemId");
      const quantity = getRecordNumber(payload, "quantity");
      const item = orderItems.find(({ id }) => id === orderItemId);
      const product =
        item?.productTitleSnapshot ?? `#${formatText(orderItemId)}`;
      const quantitySuffix =
        quantity != null
          ? translate("orders.events.quantitySuffix", { count: quantity })
          : "";

      return translate("orders.events.itemAdded", {
        product,
        quantitySuffix,
      });
    }

    case "order.totals_updated": {
      const totalAmount = getRecordNumber(payload, "totalAmount");

      return translate("orders.events.totalsUpdated", {
        amount: formatMoney(totalAmount, currency),
      });
    }

    case "order.delivery_updated": {
      const trackingNumber = payload.trackingNumber;

      return trackingNumber
        ? translate("orders.events.deliveryUpdatedWithTracking", {
            trackingNumber: String(trackingNumber),
          })
        : translate("orders.events.deliveryUpdated");
    }

    case "order.payment_updated":
      return translate("orders.events.paymentUpdated");

    case "order.status_updated":
      return translate("orders.events.statusUpdated");

    default:
      return event.type;
  }
};

const getCustomerName = (
  customer: OrderDetails["customer"] | null | undefined,
): string => {
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || EMPTY_VALUE;
};

const getCustomerInitials = (
  customer: OrderDetails["customer"] | null | undefined,
): string => {
  const initials = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join("")
    .toUpperCase();

  return initials || "?";
};

const getVariantLabel = (item: OrderItem): string => {
  if (item.variantTitleSnapshot) return item.variantTitleSnapshot;

  if (!isRecord(item.variantAttributesSnapshot)) return EMPTY_VALUE;

  const value = Object.entries(item.variantAttributesSnapshot)
    .map(([key, attributeValue]) => `${key}: ${String(attributeValue)}`)
    .join(" / ");

  return value || EMPTY_VALUE;
};

export const OrderDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ordersStore = useOrdersStore();
  const params = useParams<{ orderId: string }>();

  const orderId = coerceOrderId(params.orderId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const invalidOrderIdError =
    orderId == null ? t("orders.invalidOrderId") : null;

  const applyOrderStatusLocally = useCallback(
    (nextStatusId: number) => {
      setOrder((currentOrder) => {
        if (!currentOrder || currentOrder.statusId === nextStatusId) {
          return currentOrder;
        }

        const nextStatus =
          ordersStore.statusById.get(nextStatusId) ?? currentOrder.status;

        return {
          ...currentOrder,
          statusId: nextStatusId,
          status: nextStatus,
        };
      });
    },
    [ordersStore.statusById],
  );

  const getSourceLabel = useCallback(
    (source: string | null | undefined): string =>
      source
        ? t(`orders.sources.${source}`, { defaultValue: source })
        : EMPTY_VALUE,
    [t],
  );

  const getDeliveryProviderLabel = useCallback(
    (provider: string | null | undefined): string =>
      provider
        ? t(`orders.deliveryProviders.${provider}`, { defaultValue: provider })
        : EMPTY_VALUE,
    [t],
  );

  const getPaymentStatusTag = useCallback(
    (value: string | null | undefined) => {
      if (!value) return <Text type="secondary">{EMPTY_VALUE}</Text>;

      return (
        <Tag color={PAYMENT_STATUS_COLORS[value] ?? "default"}>
          {t(`orders.paymentStatus.${value}`, { defaultValue: value })}
        </Tag>
      );
    },
    [t],
  );

  const getDeliveryStatusTag = useCallback(
    (value: string | null | undefined) => {
      if (!value) return <Text type="secondary">{EMPTY_VALUE}</Text>;

      return (
        <Tag color={DELIVERY_STATUS_COLORS[value] ?? "default"}>
          {t(`orders.deliveryStatus.${value}`, { defaultValue: value })}
        </Tag>
      );
    },
    [t],
  );

  useEffect(() => {
    if (orderId == null) {
      return;
    }

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);

      void ordersApi
        .getById(orderId)
        .then((data) => {
          if (cancelled) return;

          setOrder(data);
        })
        .catch((e) => {
          if (cancelled) return;

          setOrder(null);
          setError(unknownErrorMessage(e));
        })
        .finally(() => {
          if (cancelled) return;

          setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const orderItems = order?.items ?? [];
  const deliveryInfos = order?.deliveryInfos ?? [];
  const primaryDeliveryInfo = deliveryInfos[0];

  const sortedEvents = useMemo(() => {
    if (!order) return [];

    return [...order.events].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [order]);

  const productColumns = useMemo<TableProps<OrderItem>["columns"]>(
    () => [
      {
        title: t("orders.product"),
        key: "product",
        render: (_, item) => (
          <Space align="start">
            <Avatar shape="square" size={56} src={item.imageUrlSnapshot} />
            <Flex vertical>
              <Text strong>{formatText(item.productTitleSnapshot)}</Text>
              <Text type="secondary">{getVariantLabel(item)}</Text>
              {item.skuSnapshot ? (
                <Text type="secondary">
                  {t("orders.sku")}: {item.skuSnapshot}
                </Text>
              ) : null}
            </Flex>
          </Space>
        ),
      },
      {
        title: t("orders.quantity"),
        dataIndex: "quantity",
        align: "right",
        width: 96,
      },
      {
        title: t("orders.price"),
        key: "unitPriceAmount",
        align: "right",
        width: 140,
        render: (_, item) => formatMoney(item.unitPriceAmount, order?.currency),
      },
      {
        title: t("orders.sum"),
        key: "totalPriceAmount",
        align: "right",
        width: 140,
        render: (_, item) =>
          formatMoney(item.totalPriceAmount, order?.currency),
      },
    ],
    [order?.currency, t],
  );

  const historyItems = useMemo<TimelineProps["items"]>(() => {
    if (!order) return [];

    return sortedEvents.map((event) => ({
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
    }));
  }, [order, sortedEvents, t]);

  const orderInfoItems: DescriptionsProps["items"] = order
    ? [
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
      ]
    : [];

  const paymentInfoItems: DescriptionsProps["items"] = order
    ? [
        {
          key: "paymentStatus",
          label: t("orders.paymentStatusLabel"),
          children: getPaymentStatusTag(order.paymentStatus),
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
      ]
    : [];

  const deliveryInfoItems: DescriptionsProps["items"] = order
    ? [
        {
          key: "deliveryStatus",
          label: t("orders.deliveryStatusLabel"),
          children: getDeliveryStatusTag(order.deliveryStatus),
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
      ]
    : [];

  const customerInfoItems: DescriptionsProps["items"] = order
    ? [
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
      ]
    : [];

  const totalsInfoItems: DescriptionsProps["items"] = order
    ? [
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
      ]
    : [];

  const tabs: TabsProps["items"] = order
    ? [
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
                    <Table
                      rowKey="id"
                      size="small"
                      pagination={false}
                      columns={productColumns}
                      dataSource={orderItems}
                    />

                    <Divider />

                    <Descriptions
                      size="small"
                      column={1}
                      items={totalsInfoItems}
                    />
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
                        <Text type="secondary">
                          {getSourceLabel(order.source)}
                        </Text>
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
                          <Text type="secondary">
                            {t("orders.customerNote")}
                          </Text>
                          <Paragraph>
                            {formatText(order.customerNote)}
                          </Paragraph>
                        </div>

                        <div>
                          <Text type="secondary">
                            {t("orders.internalNote")}
                          </Text>
                          <Paragraph>
                            {formatText(order.internalNote)}
                          </Paragraph>
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
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={productColumns}
                    dataSource={orderItems}
                  />
                </Card>
              </Col>

              <Col xs={24} xl={8}>
                <Card size="small" title={t("orders.total")}>
                  <Descriptions
                    size="small"
                    column={1}
                    items={totalsInfoItems}
                  />
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
                    <Avatar size={48}>
                      {getCustomerInitials(order.customer)}
                    </Avatar>

                    <Flex vertical>
                      <Text strong>{getCustomerName(order.customer)}</Text>
                      <Text type="secondary">
                        {getSourceLabel(order.source)}
                      </Text>
                    </Flex>
                  </Flex>

                  <Divider />

                  <Descriptions
                    size="small"
                    column={1}
                    items={customerInfoItems}
                  />
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
      ]
    : [];

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-order-details-header">
        <Flex vertical gap={16}>
          <Button
            type="link"
            onClick={() => navigate("/orders/list")}
            style={{ padding: 0, alignSelf: "flex-start" }}
          >
            ← {t("orders.backToOrders")}
          </Button>

          <Flex align="flex-start" justify="space-between" gap={16} wrap>
            <Flex vertical gap={8}>
              <PaneSectionTitle>
                {t("orders.orderTitle")}{" "}
                {(order?.id ?? orderId) ? `#${order?.id ?? orderId}` : ""}
              </PaneSectionTitle>

              {order ? (
                <>
                  <Text type="secondary">
                    {t("orders.createdAt")}: {formatDate(order.createdAt)}
                  </Text>

                  <Space wrap>
                    <GroupColoredNameTag
                      name={order.status?.name ?? formatText(order.statusId)}
                      color={order.status?.color ?? "#64748b"}
                    />
                    {getPaymentStatusTag(order.paymentStatus)}
                    {getDeliveryStatusTag(order.deliveryStatus)}
                    <OrderStatusSelect
                      orderId={order.id}
                      statusId={order.statusId}
                      onChangeSuccess={applyOrderStatusLocally}
                    />
                  </Space>
                </>
              ) : null}
            </Flex>

            {order ? (
              <Statistic
                title={t("orders.orderAmount")}
                value={formatMoney(order.totalAmount, order.currency)}
              />
            ) : null}
          </Flex>
        </Flex>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-order-details-body">
        <Spin spinning={loading}>
          {invalidOrderIdError || error ? (
            <Alert
              type="error"
              showIcon
              message={invalidOrderIdError || error}
            />
          ) : null}

          {!invalidOrderIdError && !error && !loading && !order ? (
            <Text type="secondary">{t("orders.notFound")}</Text>
          ) : null}

          {order ? (
            <Flex vertical gap={16} style={{ paddingTop: 8 }}>
              <Tabs items={tabs} />
            </Flex>
          ) : null}
        </Spin>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
