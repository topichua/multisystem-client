import { apiClient } from "@/api/api-client";

import {
  WORKSPACE_CURRENCIES,
  type WorkspaceSettings,
  type WorkspaceSettingsUpdatePayload,
} from "../model/workspace-settings.types";

const basePath = "/workspace/settings";

function isWorkspaceSettings(value: unknown): value is WorkspaceSettings {
  return (
    typeof value === "object" &&
    value !== null &&
    "workspaceId" in value &&
    "currency" in value &&
    typeof value.workspaceId === "number" &&
    typeof value.currency === "string" &&
    (WORKSPACE_CURRENCIES as readonly string[]).includes(value.currency)
  );
}

export const workspaceSettingsApi = {
  get: async (): Promise<WorkspaceSettings> => {
    const { data } = await apiClient.get<WorkspaceSettings>(basePath);
    return data;
  },

  update: async (
    payload: WorkspaceSettingsUpdatePayload,
  ): Promise<WorkspaceSettings | null> => {
    const { data } = await apiClient.patch<unknown>(basePath, payload);
    return isWorkspaceSettings(data) ? data : null;
  },
};
