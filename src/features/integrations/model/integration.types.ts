export type IntegrationType =
  | "instagram"
  | "telegram"
  | "novaposhta"
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
};

export type IntegrationsListResponse = {
  workspaceId: number;
  items: IntegrationItem[];
};

export type IntegrationCreatePayload = {
  integration_type: IntegrationType;
};

export type NovaPoshtaSenderType = "warehouse" | "address";

export type NovaPoshtaPayerType = "sender" | "recipient";

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

export type NovaPoshtaIntegrationCreatePayload = {
  name: string;
  api_key: string;
  sender_name: string;
  sender_phone: string;
  sender_ref: string;
  sender_contact_ref: string;
  sender_city_ref: string;
  sender_city_name: string;
  sender_type: NovaPoshtaSenderType;
  payment_method: NovaPoshtaPayerType;
  payer_type: NovaPoshtaPayerType;
  sender_warehouse_ref?: string;
  sender_warehouse_name?: string;
  sender_street_ref?: string;
  sender_street_name?: string;
  sender_building?: string;
  sender_flat?: string;
};

export type TelegramQrLoginSession = {
  id: number | string;
  qrImageUrl: string;
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
