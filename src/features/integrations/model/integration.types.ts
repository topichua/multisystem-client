export type IntegrationType =
  | "instagram"
  | "telegram"
  | "novaposhta"
  | "monobank"
  | "manualpayment"
  | (string & {});

export type IntegrationItem = {
  type: IntegrationType;
  id: number;
  name: string;
  connectedAt: string;
  avatar?: string;
  businessAccountId?: string;
  userName?: string;
  followersCount?: number;
  postsCount?: number;
  page?: string;
  url?: string;
  paymentProvider?: PaymentIntegrationProviderType;
  displayName?: string;
  status?: PaymentIntegrationStatus;
  isDefault?: boolean;
  credentialsMasked?: string | null;
  lastConnectionCheckAt?: string | null;
  lastError?: string | null;
  manualPaymentMethodType?: ManualPaymentMethodType;
  manualPaymentValue?: string;
  manualPaymentDisplayValue?: string;
  updatedAt?: string;
};

export type IntegrationsListResponse = {
  workspaceId: number;
  items: IntegrationItem[];
};

export type IntegrationCreatePayload = {
  integration_type: IntegrationType;
};

export type PaymentIntegrationProviderType = "monobank" | (string & {});

export type PaymentIntegrationProvider = {
  provider: PaymentIntegrationProviderType;
  label: string;
  connected: boolean;
};

export type PaymentIntegrationStatus = "connected" | (string & {});

export type PaymentIntegration = {
  id: number;
  workspaceId: number;
  provider: PaymentIntegrationProviderType;
  displayName: string;
  status: PaymentIntegrationStatus;
  isDefault: boolean;
  credentialsMasked: string | null;
  lastConnectionCheckAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentIntegrationsListResponse = {
  availableProviders: PaymentIntegrationProvider[];
  integrations: PaymentIntegration[];
};

export type MonobankIntegrationPayload = {
  merchantToken: string;
  displayName: string;
};

export type ManualPaymentMethodType = "iban" | "card" | (string & {});

export type ManualPaymentMethod = {
  id: number;
  workspaceId: number;
  name: string;
  type: ManualPaymentMethodType;
  value: string;
  displayValue: string;
  createdAt: string;
  updatedAt: string;
};

export type ManualPaymentMethodsListResponse = {
  workspaceId: number;
  items: ManualPaymentMethod[];
};

export type ManualPaymentMethodPayload = {
  name: string;
  type: ManualPaymentMethodType;
  value: string;
};

export type NovaPoshtaSenderType = "warehouse" | "address";

export type NovaPoshtaPayerType = "sender" | "recipient";

export type NovaPoshtaPaymentMethod = "cash" | "non_cash";

export type NovaPoshtaDeliveryType =
  | "cargo"
  | "documents"
  | "tires_wheels"
  | "pallet";

export type NovaPoshtaEstimatedDeliveryPrice = {
  fixed: number | null;
  takeFromOrder: boolean;
};

export type NovaPoshtaContactPerson = {
  ref: string;
  description?: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  person?: string;
  phone?: string;
};

export type NovaPoshtaSender = {
  counterparty: string;
  ref?: string;
  phone?: string;
  contactPersons: NovaPoshtaContactPerson[];
};

export type NovaPoshtaSettlement = {
  ref: string;
  description: string;
  settlementType?: string;
  area?: string;
  region?: string;
  cityRef?: string;
};

export type NovaPoshtaWarehouse = {
  ref: string;
  description: string;
  number?: string;
  category?: string;
  type?: string;
  address?: string;
  maxWeightAllowed?: number;
};

export type NovaPoshtaStreet = {
  ref: string;
  description: string;
  streetType?: string;
};

export type NovaPoshtaIntegrationFields = {
  name: string;
  sender_name: string;
  sender_phone: string;
  sender_ref: string;
  sender_contact_ref: string;
  sender_city_ref: string;
  sender_city_name: string;
  sender_type: NovaPoshtaSenderType;
  payment_method: NovaPoshtaPaymentMethod | null;
  delivery_type: NovaPoshtaDeliveryType | null;
  payer_type: NovaPoshtaPayerType;
  sender_warehouse_ref: string | null;
  sender_warehouse_name: string | null;
  sender_street_ref: string | null;
  sender_street_name: string | null;
  sender_building: string | null;
  sender_flat: string | null;
  cod_commission_payer: NovaPoshtaPayerType | null;
  default_weight_kg: number | null;
  default_width_cm: number | null;
  default_height_cm: number | null;
  default_length_cm: number | null;
  payment_purpose: string | null;
  default_delivery_description: string | null;
  estimated_delivery_price: NovaPoshtaEstimatedDeliveryPrice | null;
  on_created_order_status_id: number | null;
  on_in_transit_order_status_id: number | null;
  on_arrived_order_status_id: number | null;
  on_delivered_order_status_id: number | null;
  on_returned_order_status_id: number | null;
  on_delivery_failed_order_status_id: number | null;
};

type NovaPoshtaIntegrationCreateRequiredFieldKeys =
  | "name"
  | "sender_name"
  | "sender_phone"
  | "sender_ref"
  | "sender_contact_ref"
  | "sender_city_ref"
  | "sender_city_name"
  | "sender_type"
  | "payer_type";

type NovaPoshtaIntegrationCreateOptionalFieldKeys =
  | "payment_method"
  | "delivery_type"
  | "cod_commission_payer"
  | "default_weight_kg"
  | "default_width_cm"
  | "default_height_cm"
  | "default_length_cm"
  | "payment_purpose"
  | "default_delivery_description"
  | "estimated_delivery_price"
  | "on_created_order_status_id"
  | "on_in_transit_order_status_id"
  | "on_arrived_order_status_id"
  | "on_delivered_order_status_id"
  | "on_returned_order_status_id"
  | "on_delivery_failed_order_status_id";

export type NovaPoshtaIntegrationDetails = NovaPoshtaIntegrationFields & {
  id: number;
  workspaceId: number;
  connectedAt: string;
  createdAt: string;
  updatedAt: string;
  apiKeyConfigured: boolean;
};

export type NovaPoshtaIntegrationCreatePayload = Pick<
  NovaPoshtaIntegrationFields,
  NovaPoshtaIntegrationCreateRequiredFieldKeys
> & {
  api_key: string;
  sender_warehouse_ref?: string;
  sender_warehouse_name?: string;
  sender_street_ref?: string;
  sender_street_name?: string;
  sender_building?: string;
  sender_flat?: string;
} & Partial<
    Pick<
      NovaPoshtaIntegrationFields,
      NovaPoshtaIntegrationCreateOptionalFieldKeys
    >
  >;

export type NovaPoshtaIntegrationUpdatePayload = Partial<
  NovaPoshtaIntegrationFields & {
    api_key: string;
  }
>;

export type TelegramQrLoginSession = {
  id: number | string;
  qrImageUrl: string;
};

export type TelegramIntegrationStatus =
  | "pending_password"
  | "active"
  | (string & {});

export type TelegramIntegrationConfirmResponse = {
  id: number;
  workspaceId?: number;
  status: TelegramIntegrationStatus;
  name?: string;
  phoneNumber?: string;
  nextStep?: string;
};

export type TelegramQrLoginStartResponse = {
  id?: unknown;
  integrationId?: unknown;
  integration_id?: unknown;
  telegramIntegrationId?: unknown;
  telegram_integration_id?: unknown;
  qrImageUrl?: unknown;
  qr_image_url?: unknown;
  integration?: {
    id?: unknown;
    integrationId?: unknown;
    integration_id?: unknown;
  };
  telegramIntegration?: {
    id?: unknown;
    integrationId?: unknown;
    integration_id?: unknown;
  };
  telegram_integration?: {
    id?: unknown;
    integrationId?: unknown;
    integration_id?: unknown;
  };
};
