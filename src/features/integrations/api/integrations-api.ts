import { apiClient } from "@/api/api-client";

import type {
  IntegrationCreatePayload,
  IntegrationItem,
  IntegrationsListResponse,
} from "../model/integration.types";

const basePath = "/integrations";

export const integrationsApi = {
  list: async (): Promise<IntegrationsListResponse> => {
    const { data } = await apiClient.get<IntegrationsListResponse>(basePath);
    return data;
  },

  create: async (
    payload: IntegrationCreatePayload,
  ): Promise<IntegrationItem> => {
    const { data } = await apiClient.post<IntegrationItem>(basePath, payload);
    return data;
  },

  delete: async (
    type: IntegrationCreatePayload["integration_type"],
    id: number,
  ): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`, {
      params: { integration_type: type },
    });
  },
};
