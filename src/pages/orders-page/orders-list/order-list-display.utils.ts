import type { OrderListItem } from "@/features/orders/model/order.types";

export function formatOrderCustomerName(order: OrderListItem): string {
  return (
    [order.customer.firstName, order.customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
}
