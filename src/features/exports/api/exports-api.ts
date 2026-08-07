import { apiClient } from "@/api/api-client";
import { asRecord, getNumber, getString } from "@/api/record-parsing";

import {
  type CreateExportResponse,
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
    exportId: getString(record, ["exportId", "id"]) ?? "",
    status: normalizeStatus(getString(record, ["status"])),
    progress: getNumber(record, ["progress"]) ?? 0,
    downloadUrl: getString(record, ["downloadUrl"]),
    fileName: getString(record, ["fileName"]),
    fileSize: getNumber(record, ["fileSize"]),
    errorMessage: getString(record, ["errorMessage"]),
    createdAt: getString(record, ["createdAt"]) ?? "",
    completedAt: getString(record, ["completedAt"]),
    expiresAt: getString(record, ["expiresAt"]),
  };
}

export function normalizeCreateExportResponse(
  data: unknown,
): CreateExportResponse {
  const record = asRecord(data);
  const exportId = getString(record, ["exportId", "id"]);

  if (!exportId) {
    throw new Error("Export id is missing");
  }

  return {
    exportId,
    status: normalizeStatus(getString(record, ["status"])),
  };
}

function normalizeExportDownload(data: unknown): ExportDownload {
  const record = asRecord(data);
  const downloadUrl = getString(record, ["downloadUrl", "url"]);

  if (!downloadUrl) {
    throw new Error("Export download URL is missing");
  }

  return {
    downloadUrl,
    fileName: getString(record, ["fileName"]),
    expiresInSeconds: getNumber(record, ["expiresInSeconds"]),
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
