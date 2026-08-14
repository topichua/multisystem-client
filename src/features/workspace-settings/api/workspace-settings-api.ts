import { apiClient } from "@/api/api-client";

import {
  INVENTORY_MODE_VALUES,
  WORK_WEEKDAYS,
  WORKSPACE_CURRENCIES,
  WORKSPACE_LANGUAGES,
  type WorkDayHours,
  type WorkspaceSettings,
  type WorkspaceSettingsUpdatePayload,
  type WorkspaceWorkSchedule,
  type WorkWeekday,
} from "../model/workspace-settings.types";

const basePath = "/workspace/settings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkWeekday(value: unknown): value is WorkWeekday {
  return (
    typeof value === "string" &&
    (WORK_WEEKDAYS as readonly string[]).includes(value)
  );
}

function isWorkDayHours(value: unknown): value is WorkDayHours {
  return (
    isRecord(value) &&
    typeof value.start === "string" &&
    typeof value.end === "string"
  );
}

function isDayHours(
  value: unknown,
): value is WorkspaceWorkSchedule["dayHours"] {
  if (!isRecord(value) || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, hours]) => isWorkWeekday(key) && isWorkDayHours(hours),
  );
}

function isWorkspaceWorkSchedule(
  value: unknown,
): value is WorkspaceWorkSchedule {
  return (
    isRecord(value) &&
    typeof value.dayStart === "string" &&
    typeof value.dayEnd === "string" &&
    Array.isArray(value.workDays) &&
    value.workDays.every(isWorkWeekday) &&
    typeof value.differentHoursPerDay === "boolean" &&
    isDayHours(value.dayHours)
  );
}

function isWorkspaceSettings(value: unknown): value is WorkspaceSettings {
  return (
    isRecord(value) &&
    typeof value.workspaceId === "number" &&
    typeof value.currency === "string" &&
    (WORKSPACE_CURRENCIES as readonly string[]).includes(value.currency) &&
    typeof value.inventoryMode === "string" &&
    (INVENTORY_MODE_VALUES as readonly string[]).includes(
      value.inventoryMode,
    ) &&
    typeof value.language === "string" &&
    (WORKSPACE_LANGUAGES as readonly string[]).includes(value.language) &&
    typeof value.wishlistEnabled === "boolean" &&
    typeof value.timezone === "string" &&
    isWorkspaceWorkSchedule(value.workSchedule)
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
