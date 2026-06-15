import { apiClient } from "@/api/api-client";

import type {
  Client,
  ClientCreatePayload,
  ClientInstagramAssociationResponse,
  ClientUpdatePayload,
} from "@/features/clients/model/client.types";

const basePath = "/clients";

function normalizeClientsList(data: unknown): Client[] {
  if (Array.isArray(data)) {
    return data as Client[];
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.items)) {
      return record.items as Client[];
    }

    if (Array.isArray(record.clients)) {
      return record.clients as Client[];
    }

    if (record.client != null && typeof record.client === "object") {
      return [record.client as Client];
    }
  }

  return [];
}

export const clientsApi = {
  list: async (): Promise<Client[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}`);

    return normalizeClientsList(data);
  },

  checkInstagramAssociation: async (
    instagramId: string,
  ): Promise<ClientInstagramAssociationResponse> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: { instagramId },
    });

    if (!data || typeof data !== "object") {
      return { associated: false, status: "" };
    }

    const record = data as Record<string, unknown>;
    const associated = Boolean(record.associated);
    const status = typeof record.status === "string" ? record.status : "";
    const rawClient = record.client;
    const client =
      rawClient != null && typeof rawClient === "object"
        ? (rawClient as Client)
        : undefined;

    return client !== undefined
      ? { associated, status, client }
      : { associated, status };
  },

  create: async (payload: ClientCreatePayload): Promise<Client> => {
    const { data } = await apiClient.post<Client>(basePath, payload);

    return data;
  },

  update: async (id: number, payload: ClientUpdatePayload): Promise<Client> => {
    const { data } = await apiClient.put<Client>(`${basePath}/${id}`, payload);

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },
};
