export type IntegrationType = "instagram" | "telegram" | (string & {});

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
