import type {
  BuildOrderCreatePayloadInput,
  OrderCreatePayload,
  OrderDeliveryPayload,
} from '@/features/orders/model/order.types';

export function buildOrderCreatePayload({
  linkedClient,
  conversationId,
  orderLines,
  formValues,
}: BuildOrderCreatePayloadInput): OrderCreatePayload {
  const currency = orderLines[0]?.variant.product.currency ?? 'UAH';
  const recipientName = [linkedClient.firstName, linkedClient.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const delivery: OrderDeliveryPayload = {
    provider: formValues.deliveryMethod ?? 'nova_poshta',
  };

  if (recipientName) {
    delivery.recipientName = recipientName;
  }
  if (linkedClient.phone?.trim()) {
    delivery.phone = linkedClient.phone.trim();
  }
  if (formValues.postAddress?.trim()) {
    delivery.warehouse = formValues.postAddress.trim();
  }

  const payload: OrderCreatePayload = {
    customerId: linkedClient.id,
    conversationId,
    source: 'instagram',
    currency,
    items: orderLines.map((line) => ({
      productId: line.variant.productId,
      variantId: line.variantId,
      quantity: line.quantity,
    })),
    delivery,
  };

  const internalNote = formValues.comment?.trim();
  if (internalNote) {
    payload.internalNote = internalNote;
  }

  return payload;
}
