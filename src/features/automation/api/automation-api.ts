import { apiClient } from "@/api/api-client";

import type {
  AutomationCriteria,
  AutomationRule,
  AutomationRuleCreatePayload,
  AutomationRulesListParams,
  AutomationRuleUpdatePayload,
} from "@/features/automation/model/automation.types";
import {
  normalizeAutomationCriteria,
  normalizeAutomationRule,
  normalizeAutomationRulesList,
} from "@/features/automation/model/normalize-automation";

const basePath = "/automation_rule";

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
    const rule = normalizeAutomationRule(data);

    if (!rule) {
      throw new Error("Invalid automation rule response");
    }

    return rule;
  },

  create: async (
    payload: AutomationRuleCreatePayload,
  ): Promise<AutomationRule> => {
    const { data } = await apiClient.post<unknown>(basePath, payload);
    const rule = normalizeAutomationRule(data);

    if (!rule) {
      throw new Error("Invalid automation rule response");
    }

    return rule;
  },

  update: async (
    id: number,
    payload: AutomationRuleUpdatePayload,
  ): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${id}`,
      payload,
    );
    const rule = normalizeAutomationRule(data);

    if (!rule) {
      throw new Error("Invalid automation rule response");
    }

    return rule;
  },

  setActive: async (id: number, isActive: boolean): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${id}/active`,
      {
        isActive,
      },
    );
    const rule = normalizeAutomationRule(data);

    if (!rule) {
      throw new Error("Invalid automation rule response");
    }

    return rule;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`${basePath}/${id}`);
  },
};
