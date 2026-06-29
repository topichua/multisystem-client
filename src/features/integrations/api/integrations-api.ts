import type { AxiosRequestConfig } from "axios";

import { apiClient } from "@/api/api-client";

import type {
  IntegrationCreatePayload,
  IntegrationItem,
  IntegrationsListResponse,
  TelegramQrLoginStartResponse,
  TelegramQrLoginSession,
} from "../model/integration.types";

const basePath = "/integrations";
const telegramIntegrationsBasePath = "/telegram-integrations";
const invalidTelegramQrLoginResponseError = new Error(
  "Invalid Telegram QR login response",
);

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
  ): Promise<IntegrationItem> => {
    const telegramIntegrationId = readTelegramQrLoginId(id);

    if (telegramIntegrationId == null) {
      throw invalidTelegramQrLoginResponseError;
    }

    const { data } = await apiClient.post<IntegrationItem>(
      `${telegramIntegrationsBasePath}/${encodeURIComponent(
        String(telegramIntegrationId),
      )}/qr-login/confirm`,
      undefined,
      config,
    );

    return data;
  },
};
