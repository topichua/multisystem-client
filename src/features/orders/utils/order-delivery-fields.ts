import type {
  OrderDeliveryPayload,
  OrderDeliveryPayerType,
  OrderDeliveryType,
} from "@/features/orders/model/order.types";

export function trimmed(value: string | null | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

export function normalizeOrderDeliveryPayerType(
  value: string | null | undefined,
): OrderDeliveryPayerType | undefined {
  return value === "sender" || value === "recipient" ? value : undefined;
}

type DeliveryLocationSource = {
  city?: string | null;
  cityRef?: string | null;
  warehouse?: string | null;
  warehouseRef?: string | null;
  postAddress?: string | null;
  street?: string | null;
  streetRef?: string | null;
  building?: string | null;
  flat?: string | null;
};

function setIfPresent<K extends keyof OrderDeliveryPayload>(
  target: OrderDeliveryPayload,
  key: K,
  value: OrderDeliveryPayload[K] | undefined,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

export function assignDeliveryLocationFields(
  delivery: OrderDeliveryPayload,
  values: DeliveryLocationSource,
  deliveryType: OrderDeliveryType,
): void {
  setIfPresent(delivery, "city", trimmed(values.city));
  setIfPresent(delivery, "cityRef", trimmed(values.cityRef));

  if (deliveryType === "warehouse") {
    setIfPresent(
      delivery,
      "warehouse",
      trimmed(values.warehouse) ?? trimmed(values.postAddress),
    );
    setIfPresent(delivery, "warehouseRef", trimmed(values.warehouseRef));
    return;
  }

  setIfPresent(delivery, "street", trimmed(values.street));
  setIfPresent(delivery, "streetRef", trimmed(values.streetRef));
  setIfPresent(delivery, "building", trimmed(values.building));
  setIfPresent(delivery, "flat", trimmed(values.flat));
}

export function assignDeliveryProviderId(
  target: { providerId?: number },
  novaPoshtaIntegrationId: number | null | undefined,
): void {
  if (typeof novaPoshtaIntegrationId === "number") {
    target.providerId = novaPoshtaIntegrationId;
  }
}
