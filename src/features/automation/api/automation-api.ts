import { apiClient } from "@/api/api-client";

import type {
  AutomationCriteria,
  AutomationRule,
  AutomationRulePayload,
  AutomationRulesListParams,
} from "@/features/automation/model/automation.types";
import {
  normalizeAutomationCriteria,
  normalizeAutomationRule,
  normalizeAutomationRulesList,
} from "@/features/automation/model/normalize-automation";

const basePath = "/automation_rule";

const parseRule = (data: unknown): AutomationRule => {
  const rule = normalizeAutomationRule(data);

  if (!rule) {
    throw new Error("Invalid automation rule response");
  }

  return rule;
};

export const automationApi = {
  list: async (
    params: AutomationRulesListParams = {},
  ): Promise<AutomationRule[]> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: {
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
        ...(params.sourceType ? { sourceType: params.sourceType } : {}),
      },
    });

    return normalizeAutomationRulesList(data).items;
  },

  getCriteria: async (): Promise<AutomationCriteria> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/criteria`);
    return normalizeAutomationCriteria(data);
  },

  getById: async (id: number): Promise<AutomationRule> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/${id}`);
    return parseRule(data);
  },

  create: async (payload: AutomationRulePayload): Promise<AutomationRule> => {
    const { data } = await apiClient.post<unknown>(basePath, payload);
    return parseRule(data);
  },

  update: async (
    id: number,
    payload: AutomationRulePayload,
  ): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${id}`,
      payload,
    );
    return parseRule(data);
  },

  setActive: async (id: number, isActive: boolean): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${id}/active`,
      {
        isActive,
      },
    );
    return parseRule(data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },
};
