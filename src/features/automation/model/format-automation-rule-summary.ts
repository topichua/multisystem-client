import type { TFunction } from "i18next";

import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";

import { getAutomationConditionStatusName } from "./automation-criteria-options";
import {
  AUTOMATION_DURATION_UNIT_LABEL_KEYS,
  AUTOMATION_SOURCE_TYPE_LABEL_KEYS,
  type AutomationCriteria,
  type AutomationDurationUnit,
  type AutomationRule,
  type AutomationSourceType,
} from "./automation.types";

const getAutomationSourceTypeLabel = (
  sourceType: AutomationSourceType,
  t: TFunction,
): string => t(AUTOMATION_SOURCE_TYPE_LABEL_KEYS[sourceType]);

const formatAutomationDuration = (
  duration: {
    value?: number | null;
    unit?: AutomationDurationUnit | null;
    label?: string | null;
  },
  t: TFunction,
): string | null => {
  const label = duration.label?.trim();

  if (label) {
    return label;
  }

  if (duration.value == null || !duration.unit) {
    return null;
  }

  return t("automation.delay.summary", {
    value: duration.value,
    unit: t(AUTOMATION_DURATION_UNIT_LABEL_KEYS[duration.unit]),
  });
};

const getAutomationRuleTargetName = (
  rule: AutomationRule,
  criteria: AutomationCriteria | null,
  t: TFunction,
): string => {
  switch (rule.actionType) {
    case "CHANGE_CONVERSATION_GROUP": {
      const group =
        rule.targetConversationGroup ??
        criteria?.conversationGroups.find(
          (item) => item.id === rule.targetConversationGroupId,
        );

      if (group) {
        return getConversationGroupDisplayName(group, t);
      }

      return String(rule.targetConversationGroupId);
    }
    case "SEND_MESSAGE":
      return (
        rule.targetTemplate?.name ??
        criteria?.orderTemplates.find(
          (item) => item.id === rule.targetTemplateId,
        )?.name ??
        String(rule.targetTemplateId)
      );
    case "CHANGE_ORDER_STATUS":
      return (
        rule.targetOrderStatus?.name ??
        criteria?.statuses.find((item) => item.id === rule.targetOrderStatusId)
          ?.name ??
        String(rule.targetOrderStatusId)
      );
  }
};

const formatActionDelay = (
  rule: Extract<AutomationRule, { actionType: "SEND_MESSAGE" }>,
  t: TFunction,
): string | null =>
  formatAutomationDuration(
    {
      value: rule.actionDelayValue,
      unit: rule.actionDelayUnit,
      label: rule.actionDelayLabel,
    },
    t,
  );

export const formatAutomationRuleSummary = (
  rule: AutomationRule,
  criteria: AutomationCriteria | null,
  t: TFunction,
): string => {
  const conditionsText = rule.conditions
    .map((condition) => {
      const sourceLabel = getAutomationSourceTypeLabel(condition.sourceType, t);
      const statusName = getAutomationConditionStatusName(condition, criteria);
      const delay = formatAutomationDuration(
        {
          value: condition.durationValue,
          unit: condition.durationUnit,
          label: condition.durationLabel,
        },
        t,
      );

      const base = t(
        condition.operator === "NEQ"
          ? "automation.summary.conditionNeq"
          : "automation.summary.condition",
        {
          source: sourceLabel,
          status: statusName,
        },
      );

      return delay
        ? `${base} ${t("automation.summary.viaDelay", { delay })}`
        : base;
    })
    .join(
      ` ${t(
        rule.conditionType === "AND"
          ? "automation.summary.and"
          : "automation.summary.or",
      )} `,
    );

  const targetName = getAutomationRuleTargetName(rule, criteria, t);

  switch (rule.actionType) {
    case "SEND_MESSAGE": {
      const delay = formatActionDelay(rule, t);
      const suffixParts: string[] = [];

      if (delay) {
        suffixParts.push(t("automation.summary.viaDelay", { delay }));
      }

      if (rule.waitForBusinessHours) {
        suffixParts.push(t("automation.summary.businessHours"));
      }

      const suffix = suffixParts.length > 0 ? ` ${suffixParts.join(", ")}` : "";

      return t("automation.summary.sendMessage", {
        conditions: conditionsText,
        template: targetName,
        suffix,
      });
    }
    case "CHANGE_ORDER_STATUS":
    case "CHANGE_CONVERSATION_GROUP":
      return t("automation.summary.full", {
        conditions: conditionsText,
        target: targetName,
      });
  }
};
