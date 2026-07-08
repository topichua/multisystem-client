import type {
  BuildOrderCreatePayloadInput,
  OrderCreatePayload,
} from "@/features/orders/model/order.types";
import { buildOrderDeliveryPayload } from "@/features/orders/utils/build-order-delivery-payload";
import { normalizeOrderDiscountPercent } from "@/features/orders/utils/order-discount";

export function buildOrderCreatePayload({
  linkedClient,
  conversationId,
  orderLines,
  formValues,
}: BuildOrderCreatePayloadInput): OrderCreatePayload {
  const currency = orderLines[0]?.variant.product.currency ?? "UAH";

  const payload: OrderCreatePayload = {
    customerId: linkedClient.id,
    conversationId,
    source: "instagram",
    currency,
    items: orderLines.map((line) => ({
      productId: line.variant.productId,
      variantId: line.variantId,
      quantity: line.quantity,
    })),
  };

  if (formValues.withoutDelivery !== true) {
    payload.delivery = buildOrderDeliveryPayload(formValues, linkedClient);
  }

  const internalNote = formValues.comment?.trim();
  if (internalNote) {
    payload.internalNote = internalNote;
  }

  const discountPercent = normalizeOrderDiscountPercent(
    formValues.discountPercent,
  );
  if (discountPercent > 0) {
    payload.discountPercent = discountPercent;
  }

  return payload;
}
