import type {
  NovaPoshtaIntegrationDetails,
  NovaPoshtaIntegrationUpdatePayload,
} from "@/features/integrations/model/integration.types";

import {
  buildEstimatedDeliveryPricePayload,
  parseDeliveryTypeFromDetails,
  parseEstimatedDeliveryPriceMode,
  parsePaymentMethodFromDetails,
  trimOptional,
} from "../helpers";
import type {
  CityOption,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "../types";
import type { NovaPoshtaIntegrationEditFormValues } from "./nova-poshta-integration-card.types";

function optionalNumber(
  value: number | null | undefined,
): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return Number.isFinite(value) ? value : null;
}

export function findNovaPoshtaIntegrationDetails(
  items: NovaPoshtaIntegrationDetails[],
  integrationId: string | number,
): NovaPoshtaIntegrationDetails | null {
  return (
    items.find((item) => String(item.id) === String(integrationId)) ?? null
  );
}

export function compactValue(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export function formatOptionalNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "";
  }

  return String(value);
}

export function mergeCurrentOption<TOption extends { value: string }>(
  currentOption: TOption | null,
  options: TOption[],
): TOption[] {
  if (!currentOption) {
    return options;
  }

  return [
    currentOption,
    ...options.filter((option) => option.value !== currentOption.value),
  ];
}

export function buildCurrentSenderOption(
  details: NovaPoshtaIntegrationDetails | null,
): SenderOption | null {
  if (!details?.sender_contact_ref) {
    return null;
  }

  const label =
    compactValue([details.sender_name, details.sender_phone]) ||
    details.sender_contact_ref;

  return {
    value: details.sender_contact_ref,
    label,
    senderName: details.sender_name,
    senderPhone: details.sender_phone,
    senderRef: details.sender_ref,
    senderContactRef: details.sender_contact_ref,
  };
}

export function buildCurrentCityOption(
  details: NovaPoshtaIntegrationDetails | null,
): CityOption | null {
  if (!details?.sender_city_ref) {
    return null;
  }

  return {
    value: details.sender_city_ref,
    label: details.sender_city_name || details.sender_city_ref,
    cityName: details.sender_city_name,
    settlementRef: details.sender_city_ref,
  };
}

export function buildCurrentWarehouseOption(
  details: NovaPoshtaIntegrationDetails | null,
): WarehouseOption | null {
  if (!details?.sender_warehouse_ref) {
    return null;
  }

  return {
    value: details.sender_warehouse_ref,
    label: details.sender_warehouse_name || details.sender_warehouse_ref,
    warehouseName:
      details.sender_warehouse_name || details.sender_warehouse_ref,
  };
}

export function buildCurrentStreetOption(
  details: NovaPoshtaIntegrationDetails | null,
): StreetOption | null {
  if (!details?.sender_street_ref) {
    return null;
  }

  return {
    value: details.sender_street_ref,
    label: details.sender_street_name || details.sender_street_ref,
    streetName: details.sender_street_name || details.sender_street_ref,
  };
}

export function buildInitialValues(
  details: NovaPoshtaIntegrationDetails,
): NovaPoshtaIntegrationEditFormValues {
  return {
    name: details.name,
    apiKey: "",
    sender_name: details.sender_name,
    sender_phone: details.sender_phone,
    sender_ref: details.sender_ref,
    sender_contact_ref: details.sender_contact_ref,
    sender_city_ref: details.sender_city_ref,
    sender_city_name: details.sender_city_name,
    sender_settlement_ref: details.sender_city_ref,
    sender_type: details.sender_type,
    warehouse_ref: details.sender_warehouse_ref ?? undefined,
    warehouse_name: details.sender_warehouse_name ?? undefined,
    sender_street_ref: details.sender_street_ref ?? undefined,
    sender_street_name: details.sender_street_name ?? undefined,
    sender_building: details.sender_building ?? undefined,
    sender_flat: details.sender_flat ?? undefined,
    payer_type: details.payer_type,
    cod_commission_payer: details.cod_commission_payer ?? undefined,
    payment_method: parsePaymentMethodFromDetails(details.payment_method),
    delivery_type: parseDeliveryTypeFromDetails(details.delivery_type),
    payment_purpose: details.payment_purpose ?? undefined,
    estimated_delivery_price_mode: parseEstimatedDeliveryPriceMode(
      details.estimated_delivery_price,
    ),
    estimated_delivery_price_fixed:
      details.estimated_delivery_price?.fixed ?? undefined,
    default_weight_kg: details.default_weight_kg ?? undefined,
    default_length_cm: details.default_length_cm ?? undefined,
    default_width_cm: details.default_width_cm ?? undefined,
    default_height_cm: details.default_height_cm ?? undefined,
  };
}

export function buildUpdatePayload(
  values: NovaPoshtaIntegrationEditFormValues,
  details: NovaPoshtaIntegrationDetails,
): NovaPoshtaIntegrationUpdatePayload {
  const senderType = values.sender_type ?? details.sender_type;
  const payerType = values.payer_type ?? details.payer_type;
  const apiKey = values.apiKey?.trim();
  const payload: NovaPoshtaIntegrationUpdatePayload = {
    name: values.name?.trim() ?? details.name,
    sender_name: values.sender_name?.trim() ?? details.sender_name,
    sender_phone: values.sender_phone?.trim() ?? details.sender_phone,
    sender_ref: values.sender_ref ?? details.sender_ref,
    sender_contact_ref: values.sender_contact_ref ?? details.sender_contact_ref,
    sender_city_ref: values.sender_city_ref ?? details.sender_city_ref,
    sender_city_name: values.sender_city_name ?? details.sender_city_name,
    sender_type: senderType,
    payment_method: values.payment_method ?? null,
    ...(values.delivery_type != null
      ? { delivery_type: values.delivery_type }
      : {}),
    payer_type: payerType,
    cod_commission_payer: values.cod_commission_payer ?? null,
    payment_purpose: trimOptional(values.payment_purpose ?? undefined) ?? null,
    estimated_delivery_price: buildEstimatedDeliveryPricePayload(values),
    sender_warehouse_ref:
      senderType === "warehouse" ? (values.warehouse_ref ?? null) : null,
    sender_warehouse_name:
      senderType === "warehouse" ? (values.warehouse_name ?? null) : null,
    sender_street_ref:
      senderType === "address" ? (values.sender_street_ref ?? null) : null,
    sender_street_name:
      senderType === "address" ? (values.sender_street_name ?? null) : null,
    sender_building:
      senderType === "address"
        ? (values.sender_building?.trim() ?? null)
        : null,
    sender_flat:
      senderType === "address"
        ? (trimOptional(values.sender_flat) ?? null)
        : null,
    default_weight_kg: optionalNumber(values.default_weight_kg),
    default_length_cm: optionalNumber(values.default_length_cm),
    default_width_cm: optionalNumber(values.default_width_cm),
    default_height_cm: optionalNumber(values.default_height_cm),
  };

  if (apiKey) {
    payload.api_key = apiKey;
  }

  return payload;
}
