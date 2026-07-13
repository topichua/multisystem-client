import type {
  OrderDetails,
  OrderNovaPoshtaWaybillPayload,
} from "@/features/orders/model/order.types";

import { isRecord } from "../../../utils/order-details.utils";

import type {
  DeliveryInfo,
  TranslationFn,
} from "../order-details-content.types";

export type WaybillFormValues = {
  weightGrams?: number | null;
  seatsAmount?: number | null;
  seatsCount?: number | null;
  description?: string;
  declaredCost?: number | null;
};

const pickRecordNumber = (
  sources: unknown[],
  keys: string[],
): number | null => {
  for (const source of sources) {
    if (!isRecord(source)) {
      continue;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
};

const pickRecordString = (
  sources: unknown[],
  keys: string[],
): string | null => {
  for (const source of sources) {
    if (!isRecord(source)) {
      continue;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
};

export const getWaybillDescriptionFallback = (
  order: OrderDetails,
  t: TranslationFn,
): string => {
  const description = order.items
    .map((item) =>
      [item.productTitleSnapshot, item.variantTitleSnapshot]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" / "),
    )
    .filter(Boolean)
    .join(", ");

  return description || `${t("orders.orderTitle")} #${order.id}`;
};

export const buildWaybillInitialValues = (
  order: OrderDetails,
  t: TranslationFn,
): WaybillFormValues => {
  const sources = [order.deliveryInfo, order];

  return {
    weightGrams:
      pickRecordNumber(sources, ["weightGrams", "weight_grams"]) ?? 1,
    seatsAmount:
      pickRecordNumber(sources, ["seatsAmount", "seats_amount"]) ?? 1,
    seatsCount: pickRecordNumber(sources, ["seatsCount", "seats_count"]) ?? 1,
    description:
      pickRecordString(sources, ["description", "waybillDescription"]) ??
      getWaybillDescriptionFallback(order, t),
    declaredCost:
      pickRecordNumber(sources, ["declaredCost", "declared_cost"]) ??
      order.totalAmount,
  };
};

const normalizePositiveInteger = (
  value: number | null | undefined,
  fallback: number,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
};

const normalizeNonNegativeNumber = (
  value: number | null | undefined,
  fallback: number,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
};

export const buildWaybillPayload = (
  values: WaybillFormValues,
  fallbackDescription: string,
): OrderNovaPoshtaWaybillPayload => ({
  weightGrams: normalizePositiveInteger(values.weightGrams, 1),
  seatsAmount: normalizePositiveInteger(values.seatsAmount, 1),
  seatsCount: normalizePositiveInteger(values.seatsCount, 1),
  description: values.description?.trim() || fallbackDescription,
  declaredCost: normalizeNonNegativeNumber(values.declaredCost, 0),
});

export const hasNovaPoshtaDeliveryRefs = (
  deliveryInfo: DeliveryInfo,
): boolean => {
  if (!deliveryInfo?.cityRef) {
    return false;
  }

  if (deliveryInfo.deliveryType === "address" || deliveryInfo.streetRef) {
    return Boolean(deliveryInfo.streetRef && deliveryInfo.building?.trim());
  }

  return Boolean(deliveryInfo.warehouseRef);
};
