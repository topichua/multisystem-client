import {
  ArrowSquareOutIcon,
  CreditCardIcon,
  InstagramLogoIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import type {
  OrderDetails,
  OrderDetailsEvent,
  OrderNovaPoshtaWaybillPayload,
} from "@/features/orders/model/order.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";
import { useNotification } from "@/shared/components/notification/use-notification";

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
  isRecord,
} from "../utils/order-details.utils";

const { Text } = Typography;

type TranslationFn = ReturnType<typeof useTranslation>["t"];
type OrderItem = OrderDetails["items"][number];
type DeliveryInfo = OrderDetails["deliveryInfo"];

type OrderDetailsContentProps = {
  order: OrderDetails;
  onCreateNovaPoshtaWaybill: (
    payload: OrderNovaPoshtaWaybillPayload,
  ) => Promise<void>;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
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

type DeliveryCardProps = CustomerSectionProps & {
  onCreateNovaPoshtaWaybill: (
    payload: OrderNovaPoshtaWaybillPayload,
  ) => Promise<void>;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
};

type WaybillFormValues = {
  weightGrams?: number | null;
  seatsAmount?: number | null;
  seatsCount?: number | null;
  description?: string;
  declaredCost?: number | null;
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

const getActorLabel = (
  event: OrderDetailsEvent,
  actorNamesByUserId: Map<number, string>,
  t: TranslationFn,
): string => {
  if (event.userId != null) {
    const userName = actorNamesByUserId.get(event.userId);
    if (userName) {
      return `${t("orders.actor")}: ${userName}`;
    }
  }

  if (event.actorId != null) {
    return `${t("orders.actor")}: #${event.actorId}`;
  }

  return t("orders.details.systemActor");
};

const formatDeliveryAddress = (deliveryInfo: DeliveryInfo): string => {
  const parts = [
    deliveryInfo?.street,
    deliveryInfo?.building,
    deliveryInfo?.flat,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.join(", ");
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
  if (deliveryInfo?.deliveryType === "warehouse" || deliveryInfo?.warehouse) {
    return t("orders.details.deliveryBranchType");
  }

  if (deliveryInfo?.deliveryType === "address" || deliveryInfo?.street) {
    return t("orders.address");
  }

  return EMPTY_VALUE;
};

const getDeliveryDestination = (deliveryInfo: DeliveryInfo): string =>
  formatText(deliveryInfo?.warehouse || formatDeliveryAddress(deliveryInfo));

const pickRecordNumber = (
  sources: unknown[],
  keys: string[],
): number | null => {
  for (const source of sources) {
    if (!isRecord(source)) {
      continue;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
};

const pickRecordString = (
  sources: unknown[],
  keys: string[],
): string | null => {
  for (const source of sources) {
    if (!isRecord(source)) {
      continue;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
};

const getWaybillDescriptionFallback = (
  order: OrderDetails,
  t: TranslationFn,
): string => {
  const description = order.items
    .map((item) =>
      [item.productTitleSnapshot, item.variantTitleSnapshot]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" / "),
    )
    .filter(Boolean)
    .join(", ");

  return description || `${t("orders.orderTitle")} #${order.id}`;
};

const buildWaybillInitialValues = (
  order: OrderDetails,
  t: TranslationFn,
): WaybillFormValues => {
  const sources = [order.deliveryInfo, order];

  return {
    weightGrams:
      pickRecordNumber(sources, ["weightGrams", "weight_grams"]) ?? 1,
    seatsAmount:
      pickRecordNumber(sources, ["seatsAmount", "seats_amount"]) ?? 1,
    seatsCount: pickRecordNumber(sources, ["seatsCount", "seats_count"]) ?? 1,
    description:
      pickRecordString(sources, ["description", "waybillDescription"]) ??
      getWaybillDescriptionFallback(order, t),
    declaredCost:
      pickRecordNumber(sources, ["declaredCost", "declared_cost"]) ??
      order.totalAmount,
  };
};

const normalizePositiveInteger = (
  value: number | null | undefined,
  fallback: number,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
};

const normalizeNonNegativeNumber = (
  value: number | null | undefined,
  fallback: number,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
};

const buildWaybillPayload = (
  values: WaybillFormValues,
  fallbackDescription: string,
): OrderNovaPoshtaWaybillPayload => ({
  weightGrams: normalizePositiveInteger(values.weightGrams, 1),
  seatsAmount: normalizePositiveInteger(values.seatsAmount, 1),
  seatsCount: normalizePositiveInteger(values.seatsCount, 1),
  description: values.description?.trim() || fallbackDescription,
  declaredCost: normalizeNonNegativeNumber(values.declaredCost, 0),
});

const hasNovaPoshtaDeliveryRefs = (deliveryInfo: DeliveryInfo): boolean => {
  if (!deliveryInfo?.cityRef) {
    return false;
  }

  if (deliveryInfo.deliveryType === "address" || deliveryInfo.streetRef) {
    return Boolean(deliveryInfo.streetRef && deliveryInfo.building?.trim());
  }

  return Boolean(deliveryInfo.warehouseRef);
};

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

const HistoryCard = observer(({ order, t }: OrderSectionProps) => {
  const membersStore = useWorkspaceMembersStore();
  const actorNamesByUserId = useMemo(
    () =>
      new Map(
        membersStore.members.map((member) => [
          member.userId,
          getWorkspaceMemberName(member),
        ]),
      ),
    [membersStore.members],
  );

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
                    {getActorLabel(event, actorNamesByUserId, t)}
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
});

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
          {getOrderSourceLabel(t, order.source)}
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

const DeliveryCard = ({
  order,
  customerName,
  t,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
}: DeliveryCardProps) => {
  const primaryDeliveryInfo = order.deliveryInfo;
  const providerLabel = getDeliveryProviderLabel(
    t,
    primaryDeliveryInfo?.provider,
  );
  const notification = useNotification();
  const [waybillForm] = Form.useForm<WaybillFormValues>();
  const [waybillActionLoading, setWaybillActionLoading] = useState(false);
  const waybillInitialValues = useMemo(
    () => buildWaybillInitialValues(order, t),
    [order, t],
  );
  const deliveryStatus =
    primaryDeliveryInfo?.deliveryStatus ?? order.deliveryStatus;
  const hasTrackingNumber = Boolean(primaryDeliveryInfo?.trackingNumber);
  const deliveryShipped = deliveryStatus === "shipped";
  const canRemoveTracking =
    order.canRemoveTracking && (primaryDeliveryInfo?.canRemoveTracking ?? true);
  const createDisabledReason = (() => {
    if (deliveryShipped) {
      return t("orders.details.deliveryShippedLocked");
    }

    if (!primaryDeliveryInfo) {
      return t("orders.details.waybillMissingDelivery");
    }

    if (primaryDeliveryInfo.provider !== "nova_poshta") {
      return t("orders.details.waybillNovaPoshtaRequired");
    }

    if (order.items.length === 0) {
      return t("orders.details.waybillItemsRequired");
    }

    if (!hasNovaPoshtaDeliveryRefs(primaryDeliveryInfo)) {
      return t("orders.details.waybillRefsRequired");
    }

    return null;
  })();
  const removeDisabledReason = deliveryShipped
    ? t("orders.details.deliveryShippedLocked")
    : !canRemoveTracking
      ? t("orders.details.removeWaybillUnavailable")
      : null;
  const canCreateWaybill = !hasTrackingNumber && createDisabledReason == null;
  const canRemoveWaybill = hasTrackingNumber && removeDisabledReason == null;

  useEffect(() => {
    waybillForm.setFieldsValue(waybillInitialValues);
  }, [waybillForm, waybillInitialValues]);

  const handleCreateWaybill = useCallback(async () => {
    if (!canCreateWaybill) {
      return;
    }

    const values = await waybillForm.validateFields();
    const payload = buildWaybillPayload(
      values,
      waybillInitialValues.description ??
        getWaybillDescriptionFallback(order, t),
    );

    setWaybillActionLoading(true);

    try {
      await onCreateNovaPoshtaWaybill(payload);
      notification.success({
        title: t("orders.details.createWaybillSuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.createWaybillFailed"),
        ),
      });
    } finally {
      setWaybillActionLoading(false);
    }
  }, [
    canCreateWaybill,
    notification,
    onCreateNovaPoshtaWaybill,
    order,
    t,
    waybillForm,
    waybillInitialValues.description,
  ]);

  const handleRemoveWaybill = useCallback(() => {
    if (!canRemoveWaybill) {
      return;
    }

    Modal.confirm({
      title: t("orders.details.removeWaybillConfirmTitle"),
      content: t("orders.details.removeWaybillConfirmText"),
      okText: t("orders.details.removeWaybillConfirmOk"),
      okType: "danger",
      cancelText: t("orders.details.cancel"),
      onOk: async () => {
        setWaybillActionLoading(true);

        try {
          await onRemoveNovaPoshtaWaybill();
          notification.success({
            title: t("orders.details.removeWaybillSuccess"),
          });
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("orders.details.removeWaybillFailed"),
            ),
          });
          return Promise.reject(error);
        } finally {
          setWaybillActionLoading(false);
        }
      },
    });
  }, [canRemoveWaybill, notification, onRemoveNovaPoshtaWaybill, t]);

  return (
    <S.DetailsCard className="print-card section-delivery">
      <S.CardHeader>
        <Flex align="center" gap={10}>
          <S.MutedIcon>
            <TruckIcon size={20} />
          </S.MutedIcon>
          <S.CardTitle level={3}>{t("orders.delivery")}</S.CardTitle>
        </Flex>

        <Flex align="center" gap={8} justify="end" wrap>
          {primaryDeliveryInfo?.provider && (
            <S.ProviderTag color="red">{providerLabel}</S.ProviderTag>
          )}

          {hasTrackingNumber ? (
            <Button
              className="no-print"
              danger
              disabled={!canRemoveWaybill || waybillActionLoading}
              icon={<TrashIcon size={18} />}
              loading={waybillActionLoading}
              title={removeDisabledReason ?? undefined}
              onClick={handleRemoveWaybill}
            >
              {t("orders.details.removeWaybill")}
            </Button>
          ) : null}
        </Flex>
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

      {!hasTrackingNumber ? (
        <S.WaybillForm className="no-print">
          <Form
            disabled={deliveryShipped || waybillActionLoading}
            form={waybillForm}
            initialValues={waybillInitialValues}
            layout="vertical"
          >
            <S.WaybillFormGrid>
              <Form.Item
                label={t("orders.details.waybillWeight")}
                name="weightGrams"
                rules={[
                  {
                    required: true,
                    message: t("orders.details.requiredField"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  controls={false}
                  addonAfter={t("orders.create.shipment.grams")}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={t("orders.details.waybillSeatsAmount")}
                name="seatsAmount"
                rules={[
                  {
                    required: true,
                    message: t("orders.details.requiredField"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  controls={false}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={t("orders.details.waybillSeatsCount")}
                name="seatsCount"
                rules={[
                  {
                    required: true,
                    message: t("orders.details.requiredField"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  controls={false}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={t("orders.details.waybillDeclaredCost")}
                name="declaredCost"
                rules={[
                  {
                    required: true,
                    message: t("orders.details.requiredField"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  controls={false}
                  addonAfter={order.currency}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </S.WaybillFormGrid>

            <Form.Item
              label={t("orders.details.waybillDescription")}
              name="description"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t("orders.details.requiredField"),
                },
              ]}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>

            <S.WaybillActions>
              {createDisabledReason ? (
                <S.WaybillHint type="secondary">
                  {createDisabledReason}
                </S.WaybillHint>
              ) : null}

              <Button
                type="primary"
                disabled={!canCreateWaybill}
                icon={<PlusIcon size={18} />}
                loading={waybillActionLoading}
                onClick={handleCreateWaybill}
              >
                {t("orders.details.createWaybill")}
              </Button>
            </S.WaybillActions>
          </Form>
        </S.WaybillForm>
      ) : null}

      <S.DeliveryStatusBox>
        <DeliveryStatusTag value={primaryDeliveryInfo?.deliveryStatus} />
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

export const OrderDetailsContent = ({
  order,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
}: OrderDetailsContentProps) => {
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
          <DeliveryCard
            order={order}
            customerName={customerName}
            t={t}
            onCreateNovaPoshtaWaybill={onCreateNovaPoshtaWaybill}
            onRemoveNovaPoshtaWaybill={onRemoveNovaPoshtaWaybill}
          />
          <PaymentCard order={order} t={t} />
        </S.SideColumn>
      </S.LayoutRoot>
    </>
  );
};
