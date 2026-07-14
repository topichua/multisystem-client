import type {
  NovaPoshtaIntegrationCreatePayload,
  NovaPoshtaPayerType,
  NovaPoshtaSenderType,
} from "@/features/integrations/model/integration.types";

export type NovaPoshtaWizardFormValues = {
  name?: string;
  apiKey?: string;
  sender_contact_ref?: string;
  sender_city_ref?: string;
  sender_city_name?: string;
  sender_settlement_ref?: string;
  sender_type?: NovaPoshtaSenderType;
  warehouse_ref?: string;
  warehouse_name?: string;
  sender_street_ref?: string;
  sender_street_name?: string;
  sender_building?: string;
  sender_flat?: string;
  payer_type?: NovaPoshtaPayerType;
  cod_commission_payer?: NovaPoshtaPayerType | null;
  payment_purpose?: string | null;
  default_weight_kg?: number | null;
  default_width_cm?: number | null;
  default_height_cm?: number | null;
  default_length_cm?: number | null;
};

export type SenderOption = {
  value: string;
  label: string;
  senderName: string;
  senderPhone: string;
  senderRef: string;
  senderContactRef: string;
};

export type CityOption = {
  value: string;
  label: string;
  cityName: string;
  settlementRef: string;
};

export type WarehouseOption = {
  value: string;
  label: string;
  warehouseName: string;
};

export type StreetOption = {
  value: string;
  label: string;
  streetName: string;
};

export type RemoteSelectState<TOption> = {
  options: TOption[];
  loading: boolean;
  failed: boolean;
  search: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  clear: () => void;
};

export type UseRemoteSelectOptions<TOption> = {
  enabled: boolean;
  minSearchLength?: number;
  loadOptions: (keyword: string, signal: AbortSignal) => Promise<TOption[]>;
};

export type NovaPoshtaIntegrationWizardProps = {
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: NovaPoshtaIntegrationCreatePayload) => Promise<void>;
};
