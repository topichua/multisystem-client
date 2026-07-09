import type { Client } from "@/features/clients/model/client.types";
import type {
  OrderDeliveryPayload,
  OrderFormValues,
} from "@/features/orders/model/order.types";

function trimmed(value: string | undefined): string | undefined {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
}

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

  if (typeof formValues.novaPoshtaIntegrationId === "number") {
    delivery.providerId = formValues.novaPoshtaIntegrationId;
  }
  if (recipientName) {
    delivery.recipientName = recipientName;
  }
  if (recipientPhone?.trim()) {
    delivery.phone = recipientPhone.trim();
  }
  if (trimmed(formValues.city)) {
    delivery.city = trimmed(formValues.city);
  }
  if (trimmed(formValues.cityRef)) {
    delivery.cityRef = trimmed(formValues.cityRef);
  }
  if (deliveryType === "warehouse") {
    const warehouse =
      trimmed(formValues.warehouse) ?? trimmed(formValues.postAddress);
    if (warehouse) {
      delivery.warehouse = warehouse;
    }
    if (trimmed(formValues.warehouseRef)) {
      delivery.warehouseRef = trimmed(formValues.warehouseRef);
    }
  } else {
    if (trimmed(formValues.street)) {
      delivery.street = trimmed(formValues.street);
    }
    if (trimmed(formValues.streetRef)) {
      delivery.streetRef = trimmed(formValues.streetRef);
    }
    if (trimmed(formValues.building)) {
      delivery.building = trimmed(formValues.building);
    }
    if (trimmed(formValues.flat)) {
      delivery.flat = trimmed(formValues.flat);
    }
  }
  if (
    delivery.isCashOnDelivery &&
    typeof formValues.cashOnDeliveryAmount === "number"
  ) {
    delivery.cashOnDeliveryAmount = formValues.cashOnDeliveryAmount;
  }

  return delivery;
}
