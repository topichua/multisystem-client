import { apiClient } from "@/api/api-client";

import type {
  Client,
  ClientCreatePayload,
  ClientLinkPayload,
  ClientLookupResponse,
  ClientsGetParams,
  ClientsListQueryParams,
  ClientsListResponse,
  ClientsLookupParams,
  ClientUpdatePayload,
} from "@/features/clients/model/client.types";

import {
  buildClientsGetQueryParams,
  isClientLookupResponse,
  isClientsLookupParams,
  normalizeClient,
  normalizeClientLookupResponse,
  normalizeClientsListResponse,
} from "./clients-api.utils";

const basePath = "/clients";

async function getClients(
  params?: ClientsListQueryParams,
): Promise<ClientsListResponse>;
async function getClients(
  params: ClientsLookupParams,
): Promise<ClientLookupResponse>;
async function getClients(
  params: ClientsGetParams = {},
): Promise<ClientsListResponse | ClientLookupResponse> {
  const queryParams = buildClientsGetQueryParams(params);
  const { data } = await apiClient.get<unknown>(basePath, {
    params: queryParams,
  });

  if (isClientsLookupParams(params)) {
    return normalizeClientLookupResponse(data);
  }

  return normalizeClientsListResponse(data);
}

export const clientsApi = {
  get: getClients,

  listClients: async (
    params: ClientsListQueryParams = {},
  ): Promise<ClientsListResponse> => {
    const result = await getClients(params);

    if (isClientLookupResponse(result)) {
      throw new Error("Unexpected lookup response for clients list request");
    }

    return result;
  },

  lookupClient: async (
    params: ClientsLookupParams,
  ): Promise<ClientLookupResponse> => {
    const result = await getClients(params);
    return isClientLookupResponse(result)
      ? result
      : { associated: false, status: "" };
  },

  /** @deprecated Use listClients */
  list: async (params?: ClientsListQueryParams): Promise<Client[]> => {
    const response = await clientsApi.listClients({
      include_order_stat: true,
      ...params,
    });

    return response.items;
  },

  /** @deprecated Use lookupClient */
  checkInstagramAssociation: async (
    instagramId: string,
  ): Promise<ClientLookupResponse> => clientsApi.lookupClient({ instagramId }),

  getById: async (id: number): Promise<Client> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/${id}`);
    const client = normalizeClient(data);

    if (client == null) {
      throw new Error(`Client ${id} not found`);
    }

    return client;
  },

  create: async (payload: ClientCreatePayload): Promise<Client> => {
    const { data } = await apiClient.post<unknown>(basePath, payload);
    const client = normalizeClient(data);

    if (client == null) {
      throw new Error("Invalid client create response");
    }

    return client;
  },

  update: async (id: number, payload: ClientUpdatePayload): Promise<Client> => {
    const { data } = await apiClient.put<Client>(`${basePath}/${id}`, payload);

    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },

  createLink: async (
    clientId: number,
    payload: ClientLinkPayload,
  ): Promise<void> => {
    await apiClient.post<unknown>(`${basePath}/${clientId}/links`, payload);
  },

  deleteLink: async (
    clientId: number,
    payload: ClientLinkPayload,
  ): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${clientId}/links`, {
      data: payload,
    });
  },
};
