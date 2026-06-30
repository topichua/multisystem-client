import type { AxiosRequestConfig } from "axios";

import { apiClient } from "@/api/api-client";

import type {
  IntegrationCreatePayload,
  IntegrationItem,
  IntegrationsListResponse,
  NovaPoshtaIntegrationCreatePayload,
  NovaPoshtaIntegrationDetails,
  NovaPoshtaIntegrationUpdatePayload,
  NovaPoshtaSender,
  NovaPoshtaSettlement,
  NovaPoshtaStreet,
  NovaPoshtaWarehouse,
  TelegramIntegrationConfirmResponse,
  TelegramQrLoginStartResponse,
  TelegramQrLoginSession,
} from "../model/integration.types";

const basePath = "/integrations";
const telegramIntegrationsBasePath = "/telegram-integrations";
const novaPoshtaIntegrationsBasePath = "/novaposhta-integrations";
const novaPoshtaSearchBasePath = "/nova-poshta";
const invalidTelegramQrLoginResponseError = new Error(
  "Invalid Telegram QR login response",
);

type NovaPoshtaSearchAuth =
  | { apiKey: string }
  | { novaPoshtaIntegrationId: number | string };

type NovaPoshtaSettlementsSearchParams = {
  auth: NovaPoshtaSearchAuth;
  query: string;
};

type NovaPoshtaWarehousesSearchParams = {
  auth: NovaPoshtaSearchAuth;
  ref: string;
  query?: string;
  type?: string;
};

type NovaPoshtaStreetsSearchParams = {
  auth: NovaPoshtaSearchAuth;
  settlementRef: string;
  query: string;
};

type ListResponse<TItem> =
  | TItem[]
  | {
      data?: TItem[];
      items?: TItem[];
      senders?: TItem[];
      settlements?: TItem[];
      streets?: TItem[];
      warehouses?: TItem[];
    };

type DetailListResponse<TItem> =
  | TItem
  | TItem[]
  | {
      data?: TItem | TItem[];
      items?: TItem[];
    };

type NovaPoshtaDetailsEnvelope = {
  data?: NovaPoshtaIntegrationDetails | NovaPoshtaIntegrationDetails[];
  items?: NovaPoshtaIntegrationDetails[];
};

function readTelegramQrLoginId(
  value: unknown,
): TelegramQrLoginSession["id"] | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return null;
}

function parseTelegramQrLoginSession(
  data: TelegramQrLoginStartResponse,
): TelegramQrLoginSession {
  const id =
    readTelegramQrLoginId(data.id) ??
    readTelegramQrLoginId(data.integrationId) ??
    readTelegramQrLoginId(data.integration_id) ??
    readTelegramQrLoginId(data.telegramIntegrationId) ??
    readTelegramQrLoginId(data.telegram_integration_id) ??
    readTelegramQrLoginId(data.integration?.id) ??
    readTelegramQrLoginId(data.integration?.integrationId) ??
    readTelegramQrLoginId(data.integration?.integration_id) ??
    readTelegramQrLoginId(data.telegramIntegration?.id) ??
    readTelegramQrLoginId(data.telegramIntegration?.integrationId) ??
    readTelegramQrLoginId(data.telegramIntegration?.integration_id) ??
    readTelegramQrLoginId(data.telegram_integration?.id) ??
    readTelegramQrLoginId(data.telegram_integration?.integrationId) ??
    readTelegramQrLoginId(data.telegram_integration?.integration_id);
  const qrImageUrl =
    typeof data.qrImageUrl === "string" && data.qrImageUrl.trim()
      ? data.qrImageUrl
      : typeof data.qr_image_url === "string" && data.qr_image_url.trim()
        ? data.qr_image_url
        : null;

  if (id == null || qrImageUrl == null) {
    throw invalidTelegramQrLoginResponseError;
  }

  return { id, qrImageUrl };
}

function listFromResponse<TItem>(data: ListResponse<TItem>): TItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data.items ??
    data.data ??
    data.senders ??
    data.settlements ??
    data.warehouses ??
    data.streets ??
    []
  );
}

function isNovaPoshtaDetailsEnvelope(
  data: Exclude<
    DetailListResponse<NovaPoshtaIntegrationDetails>,
    NovaPoshtaIntegrationDetails[]
  >,
): data is NovaPoshtaDetailsEnvelope {
  return "items" in data || "data" in data;
}

function novaPoshtaDetailsFromResponse(
  data: DetailListResponse<NovaPoshtaIntegrationDetails>,
): NovaPoshtaIntegrationDetails[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (isNovaPoshtaDetailsEnvelope(data)) {
    if (Array.isArray(data.items)) {
      return data.items;
    }

    if (data.data != null) {
      return Array.isArray(data.data) ? data.data : [data.data];
    }

    return [];
  }

  return [data];
}

function withParams(
  config: AxiosRequestConfig | undefined,
  params: Record<string, string>,
): AxiosRequestConfig {
  return {
    ...config,
    params: {
      ...(config?.params as Record<string, string> | undefined),
      ...params,
    },
  };
}

function buildNovaPoshtaSearchAuthParams(
  auth: NovaPoshtaSearchAuth,
): Record<string, string> {
  if ("apiKey" in auth) {
    return { api_key: auth.apiKey.trim() };
  }

  return {
    nova_poshta_integration_id: String(auth.novaPoshtaIntegrationId),
  };
}

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
    await apiClient.delete(`${basePath}/${type}/${id}`);
  },

  startTelegramQrLogin: async (
    config?: AxiosRequestConfig,
  ): Promise<TelegramQrLoginSession> => {
    const { data } = await apiClient.post<TelegramQrLoginStartResponse>(
      `${telegramIntegrationsBasePath}/qr-login/start`,
      undefined,
      config,
    );

    return parseTelegramQrLoginSession(data);
  },

  confirmTelegramQrLogin: async (
    id: TelegramQrLoginSession["id"],
    config?: AxiosRequestConfig,
  ): Promise<TelegramIntegrationConfirmResponse> => {
    const telegramIntegrationId = readTelegramQrLoginId(id);

    if (telegramIntegrationId == null) {
      throw invalidTelegramQrLoginResponseError;
    }

    const { data } = await apiClient.post<TelegramIntegrationConfirmResponse>(
      `${telegramIntegrationsBasePath}/${encodeURIComponent(
        String(telegramIntegrationId),
      )}/qr-login/confirm`,
      undefined,
      config,
    );

    return data;
  },

  confirmTelegramPassword: async (
    id: TelegramQrLoginSession["id"],
    password: string,
    config?: AxiosRequestConfig,
  ): Promise<TelegramIntegrationConfirmResponse> => {
    const telegramIntegrationId = readTelegramQrLoginId(id);

    if (telegramIntegrationId == null) {
      throw invalidTelegramQrLoginResponseError;
    }

    const { data } = await apiClient.post<TelegramIntegrationConfirmResponse>(
      `${telegramIntegrationsBasePath}/${encodeURIComponent(
        String(telegramIntegrationId),
      )}/confirm-password`,
      { password },
      config,
    );

    return data;
  },

  createNovaPoshtaIntegration: async (
    payload: NovaPoshtaIntegrationCreatePayload,
  ): Promise<IntegrationItem> => {
    const { data } = await apiClient.post<IntegrationItem>(
      novaPoshtaIntegrationsBasePath,
      payload,
    );

    return data;
  },

  getNovaPoshtaIntegrations: async (
    config?: AxiosRequestConfig,
  ): Promise<NovaPoshtaIntegrationDetails[]> => {
    const { data } = await apiClient.get<
      DetailListResponse<NovaPoshtaIntegrationDetails>
    >(novaPoshtaIntegrationsBasePath, config);

    return novaPoshtaDetailsFromResponse(data);
  },

  updateNovaPoshtaIntegration: async (
    id: NovaPoshtaIntegrationDetails["id"],
    payload: NovaPoshtaIntegrationUpdatePayload,
  ): Promise<NovaPoshtaIntegrationDetails> => {
    const { data } = await apiClient.patch<NovaPoshtaIntegrationDetails>(
      `${novaPoshtaIntegrationsBasePath}/${encodeURIComponent(String(id))}`,
      payload,
    );

    return data;
  },

  discoverNovaPoshtaSenders: async (
    params: { auth: NovaPoshtaSearchAuth },
    config?: AxiosRequestConfig,
  ): Promise<NovaPoshtaSender[]> => {
    const { data } = await apiClient.post<ListResponse<NovaPoshtaSender>>(
      `${novaPoshtaIntegrationsBasePath}/discover-senders`,
      buildNovaPoshtaSearchAuthParams(params.auth),
      config,
    );

    return listFromResponse(data);
  },

  searchNovaPoshtaSettlements: async (
    params: NovaPoshtaSettlementsSearchParams,
    config?: AxiosRequestConfig,
  ): Promise<NovaPoshtaSettlement[]> => {
    const { data } = await apiClient.get<ListResponse<NovaPoshtaSettlement>>(
      `${novaPoshtaSearchBasePath}/settlements/search`,
      withParams(config, {
        ...buildNovaPoshtaSearchAuthParams(params.auth),
        query: params.query.trim(),
      }),
    );

    return listFromResponse(data);
  },

  searchNovaPoshtaWarehouses: async (
    params: NovaPoshtaWarehousesSearchParams,
    config?: AxiosRequestConfig,
  ): Promise<NovaPoshtaWarehouse[]> => {
    const queryParams: Record<string, string> = {
      ...buildNovaPoshtaSearchAuthParams(params.auth),
      cityRef: params.ref,
    };
    const query = params.query?.trim();
    const type = params.type?.trim();

    if (query) {
      queryParams.query = query;
    }

    if (type) {
      queryParams.type = type;
    }

    const { data } = await apiClient.get<ListResponse<NovaPoshtaWarehouse>>(
      `${novaPoshtaSearchBasePath}/warehouses/search`,
      withParams(config, queryParams),
    );

    return listFromResponse(data);
  },

  searchNovaPoshtaStreets: async (
    params: NovaPoshtaStreetsSearchParams,
    config?: AxiosRequestConfig,
  ): Promise<NovaPoshtaStreet[]> => {
    const { data } = await apiClient.get<ListResponse<NovaPoshtaStreet>>(
      `${novaPoshtaSearchBasePath}/streets/search`,
      withParams(config, {
        ...buildNovaPoshtaSearchAuthParams(params.auth),
        settlementRef: params.settlementRef,
        query: params.query.trim(),
      }),
    );

    return listFromResponse(data);
  },
};
