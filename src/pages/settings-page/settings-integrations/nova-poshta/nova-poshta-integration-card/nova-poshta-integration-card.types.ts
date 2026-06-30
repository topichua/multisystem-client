import type { FormInstance } from "antd";

import type {
  IntegrationItem,
  NovaPoshtaIntegrationDetails,
} from "@/features/integrations/model/integration.types";

import type {
  CityOption,
  NovaPoshtaWizardFormValues,
  RemoteSelectState,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "../types";

export type NovaPoshtaIntegrationCardProps = {
  integration: IntegrationItem;
  isDisconnecting: boolean;
  layout?: "desktop" | "mobile";
  onDisconnect: (integration: IntegrationItem) => void;
  onUpdated?: () => void;
};

export type NovaPoshtaIntegrationEditFormValues = NovaPoshtaWizardFormValues & {
  sender_name?: string;
  sender_phone?: string;
  sender_ref?: string;
};

export type NovaPoshtaLocationSelects = {
  cityOptions: CityOption[];
  citySelect: RemoteSelectState<CityOption>;
  form: FormInstance<NovaPoshtaIntegrationEditFormValues>;
  selectedCityRef?: string;
  selectedSenderType: NonNullable<
    NovaPoshtaIntegrationEditFormValues["sender_type"]
  >;
  selectedSettlementRef?: string;
  streetOptions: StreetOption[];
  streetSelect: RemoteSelectState<StreetOption>;
  warehouseOptions: WarehouseOption[];
  warehouseSelect: RemoteSelectState<WarehouseOption>;
  clearSelects: () => void;
  onCityChange: (value: string, option?: CityOption | CityOption[]) => void;
  onSenderTypeChange: (value: string | number) => void;
  onStreetChange: (
    value: string,
    option?: StreetOption | StreetOption[],
  ) => void;
  onWarehouseChange: (
    value: string,
    option?: WarehouseOption | WarehouseOption[],
  ) => void;
};

export type NovaPoshtaEditSenders = {
  error: string | null;
  loading: boolean;
  onSenderChange: (
    value: string,
    option?: SenderOption | SenderOption[],
  ) => void;
  senderOptions: SenderOption[];
  clear: () => void;
};

export type NovaPoshtaIntegrationEditFormProps = {
  form: FormInstance<NovaPoshtaIntegrationEditFormValues>;
  isSaving: boolean;
  locationSelects: NovaPoshtaLocationSelects;
  senderSelect: NovaPoshtaEditSenders;
  onCancel: () => void;
  onSubmit: (values: NovaPoshtaIntegrationEditFormValues) => void;
};

export type NovaPoshtaIntegrationDetailsViewProps = {
  details: NovaPoshtaIntegrationDetails;
};
