import type {
  BuildStandaloneOrderCreatePayloadInput,
  OrderCreateItemPayload,
  OrderCreatePayload,
} from "@/features/orders/model/order.types";
import { buildOrderDeliveryPayload } from "@/features/orders/utils/build-order-delivery-payload";
import { normalizeOrderDiscountPercent } from "@/features/orders/utils/order-discount";

export function buildStandaloneOrderCreatePayload({
  clientMode,
  existingClient,
  newClient,
  orderLines,
  formValues,
  source,
  orderDiscountPercent,
}: BuildStandaloneOrderCreatePayloadInput): OrderCreatePayload {
  const currency = orderLines[0]?.variant.product.currency ?? "UAH";
  const deliveryClientFallback =
    clientMode === "existing" && existingClient
      ? existingClient
      : (newClient ?? null);

  const payload: OrderCreatePayload = {
    conversationId: 0,
    source,
    currency,
    items: orderLines.map((line) => {
      const item: OrderCreateItemPayload = {
        productId: line.variant.productId,
        variantId: line.variantId,
        quantity: line.quantity,
      };
      const lineDiscountPercent = normalizeOrderDiscountPercent(
        line.discountPercent,
      );

      if (lineDiscountPercent > 0) {
        item.discountPercent = lineDiscountPercent;
      }

      return item;
    }),
  };

  if (clientMode === "existing" && existingClient) {
    payload.customerId = existingClient.id;
  }

  if (clientMode === "new" && newClient) {
    payload.customerNew = newClient;
  }

  if (formValues.withoutDelivery !== true) {
    payload.delivery = buildOrderDeliveryPayload(
      formValues,
      deliveryClientFallback,
    );
  }

  const internalNote = formValues.comment?.trim();
  if (internalNote) {
    payload.internalNote = internalNote;
  }

  const discountPercent = normalizeOrderDiscountPercent(orderDiscountPercent);
  if (discountPercent > 0) {
    payload.discountPercent = discountPercent;
  }

  return payload;
}
