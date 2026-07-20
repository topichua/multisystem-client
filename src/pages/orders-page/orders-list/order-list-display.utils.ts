import type {
  OrderCreatedBy,
  OrderListItem,
} from "@/features/orders/model/order.types";
import { getOrderSourceLabel } from "@/pages/orders-page/order-details/utils/order-details.utils";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function formatOrderCustomerName(order: OrderListItem): string {
  return (
    [order.customer.firstName, order.customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
}

export function formatOrderCreatedByName(
  createdBy: OrderCreatedBy | null | undefined,
): string {
  if (!createdBy) {
    return "—";
  }

  return (
    [createdBy.firstName, createdBy.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
}

export function formatOrderListSource(
  order: OrderListItem,
  translate: TranslateFn,
): string {
  return getOrderSourceLabel(translate, order.source);
}
