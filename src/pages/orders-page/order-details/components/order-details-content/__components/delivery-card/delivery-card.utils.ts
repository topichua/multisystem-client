import type { NovaPoshtaDeliveryType } from "@/features/integrations/model/integration.types";
import type {
  OrderDeliveryPayload,
  OrderDeliveryTrackingPayload,
  OrderNovaPoshtaWaybillPayload,
} from "@/features/orders/model/order.types";
import {
  assignDeliveryLocationFields,
  assignDeliveryProviderId,
  normalizeOrderDeliveryPayerType,
  trimmed,
} from "@/features/orders/utils/order-delivery-fields";
import type {
  CityOption,
  StreetOption,
  WarehouseOption,
} from "@/pages/settings-page/settings-integrations/nova-poshta/types";

import { EMPTY_VALUE } from "../../../../utils/order-details.utils";
import type {
  DeliveryInfo,
  TranslationFn,
} from "../../order-details-content.types";
import type {
  DeliveryAddFormValues,
  DeliveryAddPanelProps,
} from "./delivery-card.types";

export const DELIVERY_PATCH_DEBOUNCE_MS = 500;

export const drawerKey = (suffix: string) =>
  `conversation.clientOrders.drawer.${suffix}` as const;

const DEFAULT_WAYBILL = {
  weightKg: 0.5,
  widthCm: 20,
  heightCm: 10,
  lengthCm: 30,
  payerType: "recipient" as const,
  seatsAmount: 1,
  shipmentType: "cargo" as const,
};

export const SHIPMENT_TYPE_OPTIONS: NovaPoshtaDeliveryType[] = [
  "cargo",
  "documents",
  "tires_wheels",
  "pallet",
];

const SHIPMENT_TYPE_LABEL_KEYS: Record<NovaPoshtaDeliveryType, string> = {
  cargo: "integrations.novaPoshtaWizard.deliveryTypes.cargo",
  documents: "integrations.novaPoshtaWizard.deliveryTypes.documents",
  tires_wheels: "integrations.novaPoshtaWizard.deliveryTypes.tiresWheels",
  pallet: "integrations.novaPoshtaWizard.deliveryTypes.pallet",
};

export const getShipmentTypeLabel = (
  value: NovaPoshtaDeliveryType,
  t: TranslationFn,
): string => t(SHIPMENT_TYPE_LABEL_KEYS[value]);

const buildRefOption = <TOption>(
  ref: string | null | undefined,
  name: string | null | undefined,
  create: (label: string, value: string) => TOption,
): TOption | null => {
  const value = ref?.trim();
  if (!value) {
    return null;
  }

  const label = name?.trim() || value;
  return create(label, value);
};

export const buildCityOptionFromDelivery = (
  deliveryInfo: DeliveryInfo,
): CityOption | null =>
  buildRefOption(deliveryInfo?.cityRef, deliveryInfo?.city, (label, value) => ({
    value,
    label,
    cityName: label,
    settlementRef: value,
  }));

export const buildWarehouseOptionFromDelivery = (
  deliveryInfo: DeliveryInfo,
): WarehouseOption | null =>
  buildRefOption(
    deliveryInfo?.warehouseRef,
    deliveryInfo?.warehouse,
    (label, value) => ({
      value,
      label,
      warehouseName: label,
    }),
  );

export const buildStreetOptionFromDelivery = (
  deliveryInfo: DeliveryInfo,
): StreetOption | null =>
  buildRefOption(
    deliveryInfo?.streetRef,
    deliveryInfo?.street,
    (label, value) => ({
      value,
      label,
      streetName: label,
    }),
  );

export const getDeliveryFormInitialValues = ({
  primaryDeliveryInfo,
}: Pick<
  DeliveryAddPanelProps,
  "primaryDeliveryInfo"
>): DeliveryAddFormValues => {
  const cityRef = primaryDeliveryInfo?.cityRef ?? undefined;

  return {
    ...DEFAULT_WAYBILL,
    building: primaryDeliveryInfo?.building ?? undefined,
    cashOnDeliveryAmount:
      primaryDeliveryInfo?.cashOnDeliveryAmount ?? undefined,
    city: primaryDeliveryInfo?.city ?? undefined,
    cityRef,
    deliveryMethod: primaryDeliveryInfo?.provider ?? "nova_poshta",
    deliveryType: primaryDeliveryInfo?.deliveryType ?? "warehouse",
    flat: primaryDeliveryInfo?.flat ?? undefined,
    novaPoshtaIntegrationId: primaryDeliveryInfo?.providerId ?? undefined,
    paymentMode:
      primaryDeliveryInfo?.isCashOnDelivery === false
        ? "prepayment"
        : "cash_on_delivery",
    phone: primaryDeliveryInfo?.phone ?? undefined,
    recipientName: primaryDeliveryInfo?.recipientName ?? undefined,
    settlementRef: cityRef,
    street: primaryDeliveryInfo?.street ?? undefined,
    streetRef: primaryDeliveryInfo?.streetRef ?? undefined,
    trackingNumber: primaryDeliveryInfo?.trackingNumber ?? undefined,
    warehouse: primaryDeliveryInfo?.warehouse ?? undefined,
    warehouseRef: primaryDeliveryInfo?.warehouseRef ?? undefined,
  };
};

export const DELIVERY_PATCH_EXCLUDED_FIELDS = new Set([
  "weightKg",
  "lengthCm",
  "widthCm",
  "heightCm",
  "seatsAmount",
  "shipmentType",
]);

export const buildDeliveryPatchPayloadFromForm = (
  values: DeliveryAddFormValues,
): OrderDeliveryPayload => {
  const deliveryType = values.deliveryType ?? "warehouse";
  const isCashOnDelivery = values.paymentMode !== "prepayment";
  const payload: OrderDeliveryPayload = {
    provider: values.deliveryMethod ?? "nova_poshta",
    deliveryType,
    isCashOnDelivery,
    payerType:
      normalizeOrderDeliveryPayerType(values.payerType) ??
      DEFAULT_WAYBILL.payerType,
  };

  assignDeliveryProviderId(payload, values.novaPoshtaIntegrationId);
  assignDeliveryLocationFields(payload, values, deliveryType);

  const recipientName = trimmed(values.recipientName);
  if (recipientName) {
    payload.recipientName = recipientName;
  }

  const phone = trimmed(values.phone);
  if (phone) {
    payload.phone = phone;
  }

  if (isCashOnDelivery && typeof values.cashOnDeliveryAmount === "number") {
    payload.cashOnDeliveryAmount = values.cashOnDeliveryAmount;
  }

  return payload;
};

export const hasDeliveryPatchChanges = (
  next: OrderDeliveryPayload,
  prev: OrderDeliveryPayload,
): boolean => {
  const keys = new Set([...Object.keys(next), ...Object.keys(prev)]) as Set<
    keyof OrderDeliveryPayload
  >;

  for (const key of keys) {
    if (next[key] !== prev[key]) {
      return true;
    }
  }

  return false;
};

const positiveOr = (
  value: number | null | undefined,
  fallback: number,
): number => (typeof value === "number" && value > 0 ? value : fallback);

export const buildWaybillPayloadFromForm = (
  values: DeliveryAddFormValues,
): OrderNovaPoshtaWaybillPayload => ({
  default_weight_kg: positiveOr(values.weightKg, DEFAULT_WAYBILL.weightKg),
  default_width_cm: positiveOr(values.widthCm, DEFAULT_WAYBILL.widthCm),
  default_height_cm: positiveOr(values.heightCm, DEFAULT_WAYBILL.heightCm),
  default_length_cm: positiveOr(values.lengthCm, DEFAULT_WAYBILL.lengthCm),
  payer_type:
    normalizeOrderDeliveryPayerType(values.payerType) ??
    DEFAULT_WAYBILL.payerType,
  seats_amount: Math.trunc(
    positiveOr(values.seatsAmount, DEFAULT_WAYBILL.seatsAmount),
  ),
});

export const buildTrackingPayloadFromForm = (
  values: DeliveryAddFormValues,
): OrderDeliveryTrackingPayload => {
  const trackingNumber = trimmed(values.trackingNumber);
  if (!trackingNumber) {
    throw new Error("trackingNumber is required");
  }

  const payload: OrderDeliveryTrackingPayload = {
    provider: values.deliveryMethod ?? "nova_poshta",
    trackingNumber,
  };

  assignDeliveryProviderId(payload, values.novaPoshtaIntegrationId);

  const phone = trimmed(values.phone);
  if (phone) {
    payload.phone = phone;
  }

  return payload;
};

export const getDeliveryStatusLabel = (
  status: string | null | undefined,
  t: TranslationFn,
): string =>
  status
    ? t(`orders.deliveryStatus.${status}`, { defaultValue: status })
    : t("orders.details.deliveryInTransit");

export const formatTrackingNumber = (
  value: string | null | undefined,
): string => {
  const digits = value?.replace(/\D/g, "") ?? "";

  if (digits.length === 14) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)} ${digits.slice(10)}`;
  }

  return value || EMPTY_VALUE;
};

export const isFormValidationError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "errorFields" in error &&
  Array.isArray((error as { errorFields?: unknown }).errorFields);
