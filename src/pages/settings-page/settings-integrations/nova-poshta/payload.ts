import type { NovaPoshtaIntegrationCreatePayload } from "@/features/integrations/model/integration.types";

import { buildEstimatedDeliveryPricePayload, trimOptional } from "./helpers";
import type { NovaPoshtaWizardFormValues, SenderOption } from "./types";

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

function appendDeliveryDefaults(
  payload: NovaPoshtaIntegrationCreatePayload,
  values: NovaPoshtaWizardFormValues,
): void {
  payload.payment_method = values.payment_method ?? null;

  if (values.delivery_type != null) {
    payload.delivery_type = values.delivery_type;
  }

  if (values.cod_commission_payer != null) {
    payload.cod_commission_payer = values.cod_commission_payer;
  }

  const paymentPurpose = trimOptional(values.payment_purpose ?? undefined);
  if (paymentPurpose) {
    payload.payment_purpose = paymentPurpose;
  }

  payload.estimated_delivery_price = buildEstimatedDeliveryPricePayload(values);
}

function appendPackagingDefaults(
  payload: NovaPoshtaIntegrationCreatePayload,
  values: NovaPoshtaWizardFormValues,
): void {
  const defaultWeightKg = optionalNumber(values.default_weight_kg);
  const defaultLengthCm = optionalNumber(values.default_length_cm);
  const defaultWidthCm = optionalNumber(values.default_width_cm);
  const defaultHeightCm = optionalNumber(values.default_height_cm);

  if (defaultWeightKg != null) {
    payload.default_weight_kg = defaultWeightKg;
  }

  if (defaultLengthCm != null) {
    payload.default_length_cm = defaultLengthCm;
  }

  if (defaultWidthCm != null) {
    payload.default_width_cm = defaultWidthCm;
  }

  if (defaultHeightCm != null) {
    payload.default_height_cm = defaultHeightCm;
  }
}

export function buildNovaPoshtaPayload(
  values: NovaPoshtaWizardFormValues,
  senderOptionsByRef: Map<string, SenderOption>,
): NovaPoshtaIntegrationCreatePayload {
  const senderOption = values.sender_contact_ref
    ? senderOptionsByRef.get(values.sender_contact_ref)
    : undefined;
  const senderType = values.sender_type ?? "warehouse";
  const payerType = values.payer_type ?? "sender";
  const payload: NovaPoshtaIntegrationCreatePayload = {
    name: values.name?.trim() ?? "",
    api_key: values.apiKey?.trim() ?? "",
    sender_name: senderOption?.senderName ?? "",
    sender_phone: senderOption?.senderPhone ?? "",
    sender_ref: senderOption?.senderRef ?? "",
    sender_contact_ref: values.sender_contact_ref ?? "",
    sender_city_ref: values.sender_city_ref ?? "",
    sender_city_name: values.sender_city_name ?? "",
    sender_type: senderType,
    payer_type: payerType,
  };

  if (senderType === "warehouse") {
    payload.sender_warehouse_ref = values.warehouse_ref;
    payload.sender_warehouse_name = values.warehouse_name;
    appendDeliveryDefaults(payload, values);
    appendPackagingDefaults(payload, values);
    return payload;
  }

  payload.sender_street_ref = values.sender_street_ref;
  payload.sender_street_name = values.sender_street_name;
  payload.sender_building = values.sender_building?.trim();
  payload.sender_flat = trimOptional(values.sender_flat);
  appendDeliveryDefaults(payload, values);
  appendPackagingDefaults(payload, values);

  return payload;
}
