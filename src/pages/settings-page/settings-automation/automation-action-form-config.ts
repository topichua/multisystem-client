import type { TFunction } from "i18next";

import type {
  AutomationActionType,
  AutomationCriteria,
} from "@/features/automation/model/automation.types";
import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";

import {
  ACTION_DELAY_NONE,
  createDefaultSendMessageActionValues,
  createEmptyCondition,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";

export type AutomationActionTargetField =
  "targetOrderStatusId" | "targetConversationGroupId" | "targetTemplateId";

type AutomationActionFormConfig = {
  targetField: AutomationActionTargetField;
  validationKey: "targetStatus" | "targetGroup" | "targetTemplate";
  placeholderKey: "targetStatus" | "targetGroup" | "targetTemplate";
  qa: string;
  getOptions: (
    criteria: AutomationCriteria | null,
    t: TFunction,
  ) => Array<{ value: number; label: string }>;
  notFoundContentKey?: "automation.emptyTemplates";
  validateEqSameAsTarget?: boolean;
  extras?: "sendMessage";
  defaults: () => Partial<AutomationRuleFormValues>;
};

const CLEARED_ACTION_VALUES: Partial<AutomationRuleFormValues> = {
  targetOrderStatusId: undefined,
  targetConversationGroupId: undefined,
  targetTemplateId: undefined,
  actionDelayValue: null,
  actionDelayUnit: ACTION_DELAY_NONE,
  waitForBusinessHours: false,
};

export const AUTOMATION_ACTION_FORM_CONFIGS: Record<
  AutomationActionType,
  AutomationActionFormConfig
> = {
  CHANGE_ORDER_STATUS: {
    targetField: "targetOrderStatusId",
    validationKey: "targetStatus",
    placeholderKey: "targetStatus",
    qa: "settings-automation-target-status",
    validateEqSameAsTarget: true,
    defaults: () => ({}),
    getOptions: (criteria) =>
      (criteria?.statuses ?? []).map((status) => ({
        value: status.id,
        label: status.name,
      })),
  },
  CHANGE_CONVERSATION_GROUP: {
    targetField: "targetConversationGroupId",
    validationKey: "targetGroup",
    placeholderKey: "targetGroup",
    qa: "settings-automation-target-group",
    defaults: () => ({}),
    getOptions: (criteria, t) =>
      (criteria?.conversationGroups ?? []).map((group) => ({
        value: group.id,
        label: getConversationGroupDisplayName(group, t),
      })),
  },
  SEND_MESSAGE: {
    targetField: "targetTemplateId",
    validationKey: "targetTemplate",
    placeholderKey: "targetTemplate",
    qa: "settings-automation-target-template",
    notFoundContentKey: "automation.emptyTemplates",
    extras: "sendMessage",
    defaults: createDefaultSendMessageActionValues,
    getOptions: (criteria) =>
      (criteria?.orderTemplates ?? []).map((template) => ({
        value: template.id,
        label: template.name,
      })),
  },
};

export const getActionTypeChangeValues = (
  nextType: AutomationActionType,
  conditions: AutomationRuleFormValues["conditions"],
): Partial<AutomationRuleFormValues> => ({
  ...CLEARED_ACTION_VALUES,
  actionType: nextType,
  ...AUTOMATION_ACTION_FORM_CONFIGS[nextType].defaults(),
  ...(conditions.length === 0 ? { conditions: [createEmptyCondition()] } : {}),
});
