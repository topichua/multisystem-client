import { apiClient } from "@/api/api-client";

import {
  INVENTORY_MODE_VALUES,
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
    (WORKSPACE_CURRENCIES as readonly string[]).includes(value.currency) &&
    "inventoryMode" in value &&
    typeof value.inventoryMode === "string" &&
    (INVENTORY_MODE_VALUES as readonly string[]).includes(value.inventoryMode) &&
    "wishlistEnabled" in value &&
    typeof value.wishlistEnabled === "boolean"
  );
}

export const workspaceSettingsApi = {
  get: async (): Promise<WorkspaceSettings> => {
    const { data } = await apiClient.get<unknown>(basePath);

    if (!isWorkspaceSettings(data)) {
      throw new Error("Invalid workspace settings response");
    }

    return data;
  },

  update: async (
    payload: WorkspaceSettingsUpdatePayload,
  ): Promise<WorkspaceSettings | null> => {
    const { data } = await apiClient.patch<unknown>(basePath, payload);
    return isWorkspaceSettings(data) ? data : null;
  },
};
