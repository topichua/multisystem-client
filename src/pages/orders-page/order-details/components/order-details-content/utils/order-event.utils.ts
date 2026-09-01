import type { OrderDetailsEvent } from "@/features/orders/model/order.types";

import type { EventTone, TranslationFn } from "../order-details-content.types";

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
    tone: "orange",
    titleKey: "orders.details.eventTotalsUpdated",
  },
  "order.delivery_updated": {
    tone: "blue",
    titleKey: "orders.details.eventDeliveryUpdated",
  },
  "order.waybill_created": {
    tone: "green",
    titleKey: "orders.details.eventWaybillCreated",
  },
  "order.waybill_removed": {
    tone: "orange",
    titleKey: "orders.details.eventWaybillRemoved",
  },
  "order.payment_updated": {
    tone: "orange",
    titleKey: "orders.details.eventPaymentUpdated",
  },
  "order.payment_created": {
    tone: "blue",
    titleKey: "orders.details.eventPaymentCreated",
  },
  "order.payment_succeeded": {
    tone: "green",
    titleKey: "orders.details.eventPaymentSucceeded",
  },
  "order.payment_cancelled": {
    tone: "gray",
    titleKey: "orders.details.eventPaymentCancelled",
  },
  "order.payment_refund_requested": {
    tone: "orange",
    titleKey: "orders.details.eventPaymentRefundRequested",
  },
  "order.payment_refunded": {
    tone: "purple",
    titleKey: "orders.details.eventPaymentRefunded",
  },
  "order.payment_refund_cancelled": {
    tone: "gray",
    titleKey: "orders.details.eventPaymentRefundCancelled",
  },
  "order.discount_applied": {
    tone: "orange",
    titleKey: "orders.details.eventDiscountApplied",
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

export const getEventMeta = (event: OrderDetailsEvent) =>
  EVENT_META[event.type] ?? {
    tone: "gray" as const,
    titleKey: "",
  };

export const getActorLabel = (
  event: OrderDetailsEvent,
  actorNamesByUserId: Map<number, string>,
  t: TranslationFn,
): string => {
  if (event.userId != null) {
    const userName = actorNamesByUserId.get(event.userId);
    if (userName) {
      return userName;
    }
  }

  if (event.actorId != null) {
    return `#${event.actorId}`;
  }

  return t("orders.details.systemActor");
};
