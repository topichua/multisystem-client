import type { OrderDetails } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";

export { formatMoney };

type OrderItem = OrderDetails["items"][number];
type OrderEvent = OrderDetails["events"][number];
type JsonRecord = Record<string, unknown>;

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
