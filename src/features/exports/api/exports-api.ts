import { apiClient } from "@/api/api-client";
import { asNumber, asRecord, asString } from "@/api/record-parsing";

import {
  type CreateExportResponse,
  type CreateProductExportPayload,
  type ExportDownload,
  type ExportJob,
  type ExportJobStatus,
  isExportJobStatus,
} from "@/features/exports/model/export.types";

const basePath = "/exports";

function normalizeStatus(value: string | null): ExportJobStatus {
  if (value && isExportJobStatus(value)) {
    return value;
  }

  return "pending";
}

function normalizeExportJob(data: unknown): ExportJob {
  const record = asRecord(data);

  return {
    exportId: asString(record.exportId) ?? "",
    status: normalizeStatus(asString(record.status)),
    progress: asNumber(record.progress) ?? 0,
    downloadUrl: asString(record.downloadUrl),
    fileName: asString(record.fileName),
    fileSize: asNumber(record.fileSize),
    errorMessage: asString(record.errorMessage),
    createdAt: asString(record.createdAt) ?? "",
    completedAt: asString(record.completedAt),
    expiresAt: asString(record.expiresAt),
  };
}

export function normalizeCreateExportResponse(
  data: unknown,
): CreateExportResponse {
  const record = asRecord(data);
  const exportId = asString(record.exportId);

  if (!exportId) {
    throw new Error("Export id is missing");
  }

  return {
    exportId,
    status: normalizeStatus(asString(record.status)),
  };
}

function normalizeExportDownload(data: unknown): ExportDownload {
  const record = asRecord(data);
  const downloadUrl = asString(record.downloadUrl);

  if (!downloadUrl) {
    throw new Error("Export download URL is missing");
  }

  return {
    downloadUrl,
    fileName: asString(record.fileName),
    expiresInSeconds: asNumber(record.expiresInSeconds),
  };
}

export const exportsApi = {
  getStatus: async (exportId: string): Promise<ExportJob> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/${exportId}`);
    return normalizeExportJob(data);
  },

  getDownload: async (exportId: string): Promise<ExportDownload> => {
    const { data } = await apiClient.get<unknown>(
      `${basePath}/${exportId}/download`,
    );
    return normalizeExportDownload(data);
  },
};

const productsExportsPath = "/products/exports";

export const productExportsApi = {
  create: async (
    payload: CreateProductExportPayload,
  ): Promise<CreateExportResponse> => {
    const { data } = await apiClient.post<unknown>(
      productsExportsPath,
      payload,
    );
    return normalizeCreateExportResponse(data);
  },

  getStatus: async (exportId: string): Promise<ExportJob> => {
    const { data } = await apiClient.get<unknown>(
      `${productsExportsPath}/${exportId}`,
    );
    return normalizeExportJob(data);
  },

  getDownload: async (exportId: string): Promise<ExportDownload> => {
    const { data } = await apiClient.get<unknown>(
      `${productsExportsPath}/${exportId}/download`,
    );
    return normalizeExportDownload(data);
  },
};
