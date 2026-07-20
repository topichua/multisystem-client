import type { Client } from "@/features/clients/model/client.types";
import type {
  OrderDeliveryPayload,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import {
  assignDeliveryLocationFields,
  assignDeliveryProviderId,
  normalizeOrderDeliveryPayerType,
  trimmed,
} from "@/features/orders/utils/order-delivery-fields";

type DeliveryClientFallback = Pick<Client, "firstName" | "lastName" | "phone">;

export function buildOrderDeliveryPayload(
  formValues: OrderFormValues,
  linkedClient?: DeliveryClientFallback | null,
): OrderDeliveryPayload {
  const recipientName = [
    formValues.firstName ?? linkedClient?.firstName,
    formValues.lastName ?? linkedClient?.lastName,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  const recipientPhone = formValues.phone ?? linkedClient?.phone;
  const deliveryType = formValues.deliveryType ?? "warehouse";

  const delivery: OrderDeliveryPayload = {
    provider: formValues.deliveryMethod ?? "nova_poshta",
    deliveryStatus: "pending",
    deliveryType,
    isCashOnDelivery: formValues.isCashOnDelivery ?? false,
  };

  assignDeliveryProviderId(delivery, formValues.novaPoshtaIntegrationId);

  const payerType = normalizeOrderDeliveryPayerType(formValues.payerType);
  if (payerType) {
    delivery.payerType = payerType;
  }
  if (recipientName) {
    delivery.recipientName = recipientName;
  }
  const phone = trimmed(recipientPhone);
  if (phone) {
    delivery.phone = phone;
  }

  assignDeliveryLocationFields(delivery, formValues, deliveryType);

  if (
    delivery.isCashOnDelivery &&
    typeof formValues.cashOnDeliveryAmount === "number"
  ) {
    delivery.cashOnDeliveryAmount = formValues.cashOnDeliveryAmount;
  }

  return delivery;
}
