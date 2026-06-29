import type { NovaPoshtaIntegrationCreatePayload } from "@/features/integrations/model/integration.types";

import { trimOptional } from "./helpers";
import type { NovaPoshtaWizardFormValues, SenderOption } from "./types";

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
    payment_method: payerType,
    payer_type: payerType,
  };

  if (senderType === "warehouse") {
    payload.sender_warehouse_ref = values.warehouse_ref;
    payload.sender_warehouse_name = values.warehouse_name;
    return payload;
  }

  payload.sender_street_ref = values.sender_street_ref;
  payload.sender_street_name = values.sender_street_name;
  payload.sender_building = values.sender_building?.trim();
  payload.sender_flat = trimOptional(values.sender_flat);

  return payload;
}
