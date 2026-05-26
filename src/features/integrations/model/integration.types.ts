export type IntegrationType = "instagram" | "telegram" | (string & {});

export type IntegrationItem = {
  type: IntegrationType;
  id: number;
  name: string;
  connectedAt: string;
  url?: string;
};

export type IntegrationsListResponse = {
  workspaceId: number;
  items: IntegrationItem[];
};

export type IntegrationCreatePayload = {
  integration_type: IntegrationType;
};
