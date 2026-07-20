import type {
  NovaPoshtaDeliveryType,
  NovaPoshtaEstimatedDeliveryPrice,
  NovaPoshtaIntegrationDetails,
  NovaPoshtaPaymentMethod,
} from "@/features/integrations/model/integration.types";

import type {
  NovaPoshtaEstimatedDeliveryPriceMode,
  NovaPoshtaWizardFormValues,
} from "./types";

export function firstOption<TOption>(
  option: TOption | TOption[] | undefined,
): TOption | undefined {
  return Array.isArray(option) ? option[0] : option;
}

export function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getClearLocationFieldsValues(): Pick<
  NovaPoshtaWizardFormValues,
  | "warehouse_ref"
  | "warehouse_name"
  | "sender_street_ref"
  | "sender_street_name"
  | "sender_building"
  | "sender_flat"
> {
  return {
    warehouse_ref: undefined,
    warehouse_name: undefined,
    sender_street_ref: undefined,
    sender_street_name: undefined,
    sender_building: undefined,
    sender_flat: undefined,
  };
}

export function getClearCityAndLocationFieldsValues(): Pick<
  NovaPoshtaWizardFormValues,
  | "sender_city_ref"
  | "sender_city_name"
  | "sender_settlement_ref"
  | "warehouse_ref"
  | "warehouse_name"
  | "sender_street_ref"
  | "sender_street_name"
  | "sender_building"
  | "sender_flat"
> {
  return {
    sender_city_ref: undefined,
    sender_city_name: undefined,
    sender_settlement_ref: undefined,
    ...getClearLocationFieldsValues(),
  };
}

export function parsePaymentMethodFromDetails(
  paymentMethod: NovaPoshtaIntegrationDetails["payment_method"],
): NovaPoshtaPaymentMethod | undefined {
  if (paymentMethod === "cash" || paymentMethod === "non_cash") {
    return paymentMethod;
  }

  return undefined;
}

export function parseDeliveryTypeFromDetails(
  deliveryType: NovaPoshtaIntegrationDetails["delivery_type"],
): NovaPoshtaDeliveryType | undefined {
  if (
    deliveryType === "cargo" ||
    deliveryType === "documents" ||
    deliveryType === "tires_wheels" ||
    deliveryType === "pallet"
  ) {
    return deliveryType;
  }

  return undefined;
}

export function parseEstimatedDeliveryPriceMode(
  estimatedDeliveryPrice: NovaPoshtaIntegrationDetails["estimated_delivery_price"],
): NovaPoshtaEstimatedDeliveryPriceMode {
  if (estimatedDeliveryPrice?.takeFromOrder === false) {
    return "fixed";
  }

  return "order_amount";
}

export function buildEstimatedDeliveryPricePayload(
  values: Pick<
    NovaPoshtaWizardFormValues,
    "estimated_delivery_price_mode" | "estimated_delivery_price_fixed"
  >,
): NovaPoshtaEstimatedDeliveryPrice {
  if (values.estimated_delivery_price_mode === "fixed") {
    const fixed = optionalNumber(values.estimated_delivery_price_fixed);

    return {
      fixed: fixed ?? null,
      takeFromOrder: false,
    };
  }

  return {
    fixed: null,
    takeFromOrder: true,
  };
}

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
