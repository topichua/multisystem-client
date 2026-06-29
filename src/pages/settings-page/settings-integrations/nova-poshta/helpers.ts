import type { NovaPoshtaWizardFormValues } from "./types";

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
