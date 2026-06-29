import {
  ArrowSquareOutIcon,
  CreditCardIcon,
  InstagramLogoIcon,
  PencilSimpleIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { Avatar, Button, Empty, Flex, Typography } from "antd";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { pagesMap } from "@/app/router/pages-map";
import type {
  OrderDetails,
  OrderDetailsEvent,
} from "@/features/orders/model/order.types";

import * as S from "./order-details-content.styled";
import { DeliveryStatusTag, PaymentStatusTag } from "./order-status-tags";
import {
  EMPTY_VALUE,
  formatDate,
  formatMoney,
  formatText,
  getCustomerInitials,
  getCustomerName,
  getDeliveryProviderLabel,
  getEventDescription,
  getOrderSourceLabel,
  getVariantLabel,
} from "../utils/order-details.utils";

const { Text } = Typography;

type TranslationFn = ReturnType<typeof useTranslation>["t"];
type OrderItem = OrderDetails["items"][number];
type DeliveryInfo = OrderDetails["deliveryInfos"][number] | null | undefined;

type OrderDetailsContentProps = {
  order: OrderDetails;
};

type InfoItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

type EventTone = "blue" | "green" | "gold" | "purple" | "gray";

type OrderSectionProps = {
  order: OrderDetails;
  t: TranslationFn;
};

type CustomerSectionProps = OrderSectionProps & {
  customerName: string;
};

const EVENT_META: Record<
  string,
  {
    tone: EventTone;
    titleKey: string;
  }
> = {
  "order.created": {
    tone: "green",
    titleKey: "orders.details.eventCreated",
  },
  "order.item_added": {
    tone: "purple",
    titleKey: "orders.details.eventItemAdded",
  },
  "order.totals_updated": {
    tone: "gold",
    titleKey: "orders.details.eventTotalsUpdated",
  },
  "order.delivery_updated": {
    tone: "blue",
    titleKey: "orders.details.eventDeliveryUpdated",
  },
  "order.payment_updated": {
    tone: "gold",
    titleKey: "orders.details.eventPaymentUpdated",
  },
  "order.status_updated": {
    tone: "blue",
    titleKey: "orders.details.eventStatusUpdated",
  },
  "order.status_changed": {
    tone: "blue",
    titleKey: "orders.details.eventStatusUpdated",
  },
};

const getEventMeta = (event: OrderDetailsEvent) =>
  EVENT_META[event.type] ?? {
    tone: "gray" as const,
    titleKey: "",
  };

const getInstagramHandle = (value: string | null | undefined): string => {
  if (!value) return EMPTY_VALUE;

  return value.startsWith("@") ? value : `@${value}`;
};

const getDiscountDisplayValue = (discountAmount: number): number =>
  discountAmount > 0 ? -discountAmount : discountAmount;

const getProductMeta = (item: OrderItem): string => {
  const variantLabel = getVariantLabel(item);
  const parts: string[] = [];

  if (variantLabel !== EMPTY_VALUE) {
    parts.push(variantLabel);
  }

  if (item.skuSnapshot) {
    parts.push(item.skuSnapshot);
  }

  return parts.join(" / ") || EMPTY_VALUE;
};

const getDeliveryTypeLabel = (
  deliveryInfo: DeliveryInfo,
  t: TranslationFn,
): string => {
  if (deliveryInfo?.warehouse) {
    return t("orders.details.deliveryBranchType");
  }

  if (deliveryInfo?.address) {
    return t("orders.address");
  }

  return EMPTY_VALUE;
};

const getDeliveryDestination = (deliveryInfo: DeliveryInfo): string =>
  formatText(deliveryInfo?.warehouse || deliveryInfo?.address);

const InfoList = ({ items }: { items: InfoItem[] }) => (
  <S.InfoGrid>
    {items.map((item) => (
      <S.InfoPair key={item.key}>
        <S.InfoLabel>{item.label}</S.InfoLabel>
        <S.InfoValue>{item.value}</S.InfoValue>
      </S.InfoPair>
    ))}
  </S.InfoGrid>
);

const CopyableText = ({ value }: { value: string | null | undefined }) =>
  value ? <Text copyable>{value}</Text> : EMPTY_VALUE;

const PrintDocumentHeader = ({ order, t }: OrderSectionProps) => (
  <S.PrintDocumentHeader className="print-only">
    <S.PrintDocumentTitle level={2}>
      {t("orders.orderTitle")} #{order.id}
    </S.PrintDocumentTitle>

    <S.PrintDocumentMeta>
      {order.status ? (
        <span>
          {t("orders.table.status")}: {order.status.name}
        </span>
      ) : null}
      <span>
        {t("orders.createdAt")} {formatDate(order.createdAt)}
      </span>
      <span>{getOrderSourceLabel(t, order.source)}</span>
    </S.PrintDocumentMeta>
  </S.PrintDocumentHeader>
);

const ProductsCard = ({ order, t }: OrderSectionProps) => {
  const discountDisplayValue = getDiscountDisplayValue(order.discountAmount);

  return (
    <S.DetailsCard className="print-card section-products">
      <S.CardHeader>
        <Flex align="center" gap={10} wrap>
          <S.CardTitle level={3}>{t("orders.productsTab")}</S.CardTitle>
          <S.CountBadge>{order.items.length}</S.CountBadge>
        </Flex>

        <Flex align="center" gap={8} wrap className="no-print">
          <Button
            disabled
            icon={<PencilSimpleIcon size={18} />}
            title={t("orders.details.editUnavailable")}
          >
            {t("orders.details.edit")}
          </Button>
        </Flex>
      </S.CardHeader>

      {order.items.length ? (
        <S.ProductsList>
          {order.items.map((item) => (
            <S.ProductRow key={item.id}>
              <S.ProductImage
                shape="square"
                size={64}
                src={item.imageUrlSnapshot ?? undefined}
              >
                {formatText(item.productTitleSnapshot).slice(0, 1)}
              </S.ProductImage>

              <S.ProductInfo>
                <S.ProductName>
                  {formatText(item.productTitleSnapshot)}
                </S.ProductName>
                <S.ProductMeta>{getProductMeta(item)}</S.ProductMeta>
              </S.ProductInfo>

              <S.ProductPrice>
                <Text type="secondary">
                  {item.quantity} x{" "}
                  {formatMoney(item.unitPriceAmount, order.currency)}
                </Text>
              </S.ProductPrice>

              <S.ProductTotal strong>
                {formatMoney(item.totalPriceAmount, order.currency)}
              </S.ProductTotal>
            </S.ProductRow>
          ))}
        </S.ProductsList>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.productsTab")}
        />
      )}

      <S.TotalsList>
        <S.TotalRow>
          <Text type="secondary">{t("orders.subtotal")}</Text>
          <Text>{formatMoney(order.subtotalAmount, order.currency)}</Text>
        </S.TotalRow>

        <S.TotalRow>
          <Text type="secondary">{t("orders.deliveryAmount")}</Text>
          <Text>{formatMoney(order.deliveryAmount, order.currency)}</Text>
        </S.TotalRow>

        <S.TotalRow>
          <S.DiscountText>{t("orders.discount")}</S.DiscountText>
          <S.DiscountText strong>
            {formatMoney(discountDisplayValue, order.currency)}
          </S.DiscountText>
        </S.TotalRow>

        <S.GrandTotalRow>
          <S.GrandTotalLabel>{t("orders.total")}</S.GrandTotalLabel>
          <S.GrandTotalValue>
            {formatMoney(order.totalAmount, order.currency)}
          </S.GrandTotalValue>
        </S.GrandTotalRow>
      </S.TotalsList>
    </S.DetailsCard>
  );
};

const HistoryCard = ({ order, t }: OrderSectionProps) => {
  const sortedEvents = useMemo(
    () =>
      [...order.events].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [order.events],
  );

  return (
    <S.DetailsCard className="no-print print-card section-history">
      <S.CardHeader>
        <S.CardTitle level={3}>{t("orders.details.statusHistory")}</S.CardTitle>
      </S.CardHeader>

      {sortedEvents.length ? (
        <S.HistoryList>
          {sortedEvents.map((event, index) => {
            const eventMeta = getEventMeta(event);
            const eventTitle = eventMeta.titleKey
              ? t(eventMeta.titleKey)
              : event.type;

            return (
              <S.HistoryItem
                key={event.id}
                $isLast={index === sortedEvents.length - 1}
              >
                <S.HistoryMarker $tone={eventMeta.tone} />

                <S.HistoryContent>
                  <S.StatusPill $tone={eventMeta.tone}>
                    <S.StatusDot />
                    {eventTitle}
                  </S.StatusPill>

                  <S.HistoryDescription>
                    {getEventDescription(event, order.items, order.currency, t)}
                  </S.HistoryDescription>

                  <S.HistoryActor type="secondary">
                    {event.actorId
                      ? `${t("orders.actor")}: #${event.actorId}`
                      : t("orders.details.systemActor")}
                  </S.HistoryActor>
                </S.HistoryContent>

                <S.HistoryDate type="secondary">
                  {formatDate(event.createdAt)}
                </S.HistoryDate>
              </S.HistoryItem>
            );
          })}
        </S.HistoryList>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noHistory")}
        />
      )}
    </S.DetailsCard>
  );
};

const CustomerCard = ({ order, customerName, t }: CustomerSectionProps) => (
  <S.DetailsCard className="print-card section-customer">
    <S.CardHeader>
      <S.CardTitle level={3}>{t("orders.customer")}</S.CardTitle>
    </S.CardHeader>

    <S.CustomerHeader>
      <Avatar size={44}>{getCustomerInitials(order.customer)}</Avatar>

      <S.CustomerIdentity>
        <S.CustomerName>{customerName}</S.CustomerName>

        <S.CustomerSource>
          <InstagramLogoIcon size={16} />
          {getInstagramHandle(order.customer.instagramUserId)}
        </S.CustomerSource>
      </S.CustomerIdentity>
    </S.CustomerHeader>

    <InfoList
      items={[
        {
          key: "phone",
          label: t("orders.phone"),
          value: <CopyableText value={order.customer.phone} />,
        },
        {
          key: "source",
          label: t("orders.source"),
          value: getOrderSourceLabel(t, order.source),
        },
        {
          key: "customerId",
          label: t("orders.customerId"),
          value: order.customer.id,
        },
      ]}
    />

    <S.ProfileLink className="no-print" href={pagesMap.clientsWorkspace}>
      <ArrowSquareOutIcon size={16} />
      {t("orders.details.clientProfile")}
    </S.ProfileLink>
  </S.DetailsCard>
);

const DeliveryCard = ({ order, customerName, t }: CustomerSectionProps) => {
  const primaryDeliveryInfo = order.deliveryInfos[0] ?? null;
  const providerLabel = getDeliveryProviderLabel(
    t,
    primaryDeliveryInfo?.provider,
  );

  return (
    <S.DetailsCard className="print-card section-delivery">
      <S.CardHeader>
        <Flex align="center" gap={10}>
          <S.MutedIcon>
            <TruckIcon size={20} />
          </S.MutedIcon>
          <S.CardTitle level={3}>{t("orders.delivery")}</S.CardTitle>
        </Flex>

        {primaryDeliveryInfo?.provider ? (
          <S.ProviderTag color="red">{providerLabel}</S.ProviderTag>
        ) : null}
      </S.CardHeader>

      <S.TrackingPanel>
        <S.TrackingLabel>{t("orders.details.waybillNumber")}</S.TrackingLabel>
        {primaryDeliveryInfo?.trackingNumber ? (
          <S.TrackingNumber copyable>
            {primaryDeliveryInfo.trackingNumber}
          </S.TrackingNumber>
        ) : (
          <S.TrackingNumber>{EMPTY_VALUE}</S.TrackingNumber>
        )}
      </S.TrackingPanel>

      <S.DeliveryStatusBox>
        <DeliveryStatusTag value={order.deliveryStatus} />
      </S.DeliveryStatusBox>

      <InfoList
        items={[
          {
            key: "type",
            label: t("orders.details.deliveryType"),
            value: getDeliveryTypeLabel(primaryDeliveryInfo, t),
          },
          {
            key: "city",
            label: t("orders.city"),
            value: formatText(primaryDeliveryInfo?.city),
          },
          {
            key: "warehouse",
            label: t("orders.warehouse"),
            value: getDeliveryDestination(primaryDeliveryInfo),
          },
          {
            key: "recipient",
            label: t("orders.recipientName"),
            value: formatText(
              primaryDeliveryInfo?.recipientName || customerName,
            ),
          },
          {
            key: "phone",
            label: t("orders.phone"),
            value: <CopyableText value={primaryDeliveryInfo?.phone} />,
          },
          {
            key: "cost",
            label: t("orders.price"),
            value: formatMoney(order.deliveryAmount, order.currency),
          },
        ]}
      />
    </S.DetailsCard>
  );
};

const PaymentCard = ({ order, t }: OrderSectionProps) => (
  <S.DetailsCard className="no-print print-card section-payment">
    <S.CardHeader>
      <Flex align="center" gap={10}>
        <S.MutedIcon>
          <CreditCardIcon size={20} />
        </S.MutedIcon>
        <S.CardTitle level={3}>{t("orders.payment")}</S.CardTitle>
      </Flex>
    </S.CardHeader>

    <InfoList
      items={[
        {
          key: "method",
          label: t("orders.details.paymentMethod"),
          value: t("orders.details.paymentCashOnDelivery"),
        },
        {
          key: "status",
          label: t("orders.details.paymentStatusField"),
          value: <PaymentStatusTag value={order.paymentStatus} />,
        },
        {
          key: "amount",
          label: t("orders.details.amountToPay"),
          value: (
            <S.AmountDue>
              {formatMoney(order.totalAmount, order.currency)}
            </S.AmountDue>
          ),
        },
      ]}
    />
  </S.DetailsCard>
);

export const OrderDetailsContent = ({ order }: OrderDetailsContentProps) => {
  const { t } = useTranslation();
  const customerName = getCustomerName(order.customer);

  return (
    <>
      <S.PrintStyles />

      <S.LayoutRoot className="print-content">
        <PrintDocumentHeader order={order} t={t} />

        <S.MainColumn>
          <ProductsCard order={order} t={t} />
          <HistoryCard order={order} t={t} />
        </S.MainColumn>

        <S.SideColumn>
          <CustomerCard order={order} customerName={customerName} t={t} />
          <DeliveryCard order={order} customerName={customerName} t={t} />
          <PaymentCard order={order} t={t} />
        </S.SideColumn>
      </S.LayoutRoot>
    </>
  );
};
