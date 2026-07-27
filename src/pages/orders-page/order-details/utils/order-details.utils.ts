import type { OrderDetails } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatDateTime } from "@/utils/date-time";

export { formatMoney };

type OrderItem = OrderDetails["items"][number];
type OrderEvent = OrderDetails["events"][number];
type JsonRecord = Record<string, unknown>;
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const EMPTY_VALUE = "—";

export const coerceOrderId = (value: string | undefined): number | null => {
  if (!value) return null;

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
};

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getRecordNumber = (
  record: JsonRecord,
  key: string,
): number | null => {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export const formatText = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;

  return String(value);
};

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return EMPTY_VALUE;

  return formatDateTime(value) || EMPTY_VALUE;
};

export const getOrderSourceLabel = (
  translate: TranslateFn,
  source: string | null | undefined,
): string =>
  source
    ? translate(`orders.sources.${source}`, { defaultValue: source })
    : EMPTY_VALUE;

export const getDeliveryProviderLabel = (
  translate: TranslateFn,
  provider: string | null | undefined,
): string =>
  provider
    ? translate(`orders.deliveryProviders.${provider}`, {
        defaultValue: provider,
      })
    : EMPTY_VALUE;

export const getCustomerName = (
  customer: OrderDetails["customer"] | null | undefined,
): string => {
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || EMPTY_VALUE;
};

export const getCustomerInitials = (
  customer: OrderDetails["customer"] | null | undefined,
): string => {
  const initials = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join("")
    .toUpperCase();

  return initials || "?";
};

export const getVariantLabel = (item: OrderItem): string => {
  if (item.variantTitleSnapshot) return item.variantTitleSnapshot;

  if (!isRecord(item.variantAttributesSnapshot)) return EMPTY_VALUE;

  const value = Object.entries(item.variantAttributesSnapshot)
    .map(([key, attributeValue]) => `${key}: ${String(attributeValue)}`)
    .join(" / ");

  return value || EMPTY_VALUE;
};

export const getEventDescription = (
  event: OrderEvent,
  orderItems: OrderItem[],
  currency: string,
  translate: TranslateFn,
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
      const trackingNumber =
        typeof payload.trackingNumber === "string" &&
        payload.trackingNumber.trim()
          ? payload.trackingNumber.trim()
          : null;
      const deliveryStatus =
        typeof payload.deliveryStatus === "string" &&
        payload.deliveryStatus.trim()
          ? payload.deliveryStatus.trim()
          : null;
      const statusLabel = deliveryStatus
        ? translate(`orders.deliveryStatus.${deliveryStatus}`, {
            defaultValue: deliveryStatus,
          })
        : null;

      if (trackingNumber && statusLabel) {
        return translate("orders.events.deliveryUpdatedWithTrackingAndStatus", {
          trackingNumber,
          status: statusLabel,
        });
      }

      if (trackingNumber) {
        return translate("orders.events.deliveryUpdatedWithTracking", {
          trackingNumber,
        });
      }

      if (statusLabel) {
        return translate("orders.events.deliveryUpdatedWithStatus", {
          status: statusLabel,
        });
      }

      return translate("orders.events.deliveryUpdated");
    }

    case "order.waybill_created": {
      const trackingNumber =
        typeof payload.trackingNumber === "string" &&
        payload.trackingNumber.trim()
          ? payload.trackingNumber.trim()
          : null;

      return trackingNumber
        ? translate("orders.events.waybillCreatedWithTracking", {
            trackingNumber,
          })
        : translate("orders.events.waybillCreated");
    }

    case "order.waybill_removed": {
      const trackingNumber =
        typeof payload.trackingNumber === "string" &&
        payload.trackingNumber.trim()
          ? payload.trackingNumber.trim()
          : null;

      return trackingNumber
        ? translate("orders.events.waybillRemovedWithTracking", {
            trackingNumber,
          })
        : translate("orders.events.waybillRemoved");
    }

    case "order.payment_updated":
      return translate("orders.events.paymentUpdated");

    case "order.payment_created": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentCreatedWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentCreated");
    }

    case "order.payment_succeeded": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentSucceededWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentSucceeded");
    }

    case "order.payment_cancelled": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentCancelledWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentCancelled");
    }

    case "order.payment_refund_requested": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentRefundRequestedWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentRefundRequested");
    }

    case "order.payment_refunded": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentRefundedWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentRefunded");
    }

    case "order.payment_refund_cancelled": {
      const amount = getRecordNumber(payload, "amount");
      return amount != null
        ? translate("orders.events.paymentRefundCancelledWithAmount", {
            amount: formatMoney(amount, currency),
          })
        : translate("orders.events.paymentRefundCancelled");
    }

    case "order.discount_applied": {
      const discountAmount = getRecordNumber(payload, "discountAmount");
      const discountPercent = getRecordNumber(payload, "discountPercent");

      if (discountPercent != null && discountPercent > 0) {
        return translate("orders.events.discountAppliedPercent", {
          percent: discountPercent,
        });
      }

      if (discountAmount != null && discountAmount > 0) {
        return translate("orders.events.discountAppliedAmount", {
          amount: formatMoney(discountAmount, currency),
        });
      }

      return translate("orders.events.discountApplied");
    }

    case "order.status_updated":
    case "order.status_changed": {
      const statusName =
        typeof payload.statusName === "string" && payload.statusName.trim()
          ? payload.statusName.trim()
          : null;

      return statusName
        ? translate("orders.events.statusUpdatedTo", { status: statusName })
        : translate("orders.events.statusUpdated");
    }

    default:
      return event.type;
  }
};
