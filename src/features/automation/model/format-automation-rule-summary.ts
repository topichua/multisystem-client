import type { TFunction } from "i18next";

import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";

import type {
  AutomationCriteria,
  AutomationRule,
  AutomationRuleCondition,
  AutomationSourceType,
} from "./automation.types";

export const getAutomationSourceTypeLabel = (
  sourceType: AutomationSourceType,
  t: TFunction,
): string => {
  if (sourceType === "DELIVERY_STATUS") {
    return t("automation.sourceType.delivery");
  }

  if (sourceType === "PAYMENT_STATUS") {
    return t("automation.sourceType.payment");
  }

  return t("automation.sourceType.order");
};

export const getConditionStatusName = (
  condition: AutomationRuleCondition,
  criteria: AutomationCriteria | null,
): string => {
  if (condition.sourceType === "ORDER_STATUS") {
    return (
      criteria?.statuses.find(
        (item) => String(item.id) === condition.sourceStatus,
      )?.name ?? condition.sourceStatus
    );
  }

  const options =
    condition.sourceType === "PAYMENT_STATUS"
      ? criteria?.payment
      : criteria?.delivery;

  return (
    options?.find((item) => item.id === condition.sourceStatus)?.name ??
    condition.sourceStatus
  );
};

const getAutomationRuleTargetName = (
  rule: AutomationRule,
  criteria: AutomationCriteria | null,
  t: TFunction,
): string => {
  if (rule.actionType === "CHANGE_CONVERSATION_GROUP") {
    const group =
      rule.targetConversationGroup ??
      criteria?.conversationGroups.find(
        (item) => item.id === rule.targetConversationGroupId,
      );

    if (group) {
      return getConversationGroupDisplayName(group, t);
    }

    return String(rule.targetConversationGroupId ?? "");
  }

  return (
    rule.targetOrderStatus?.name ??
    criteria?.statuses.find((item) => item.id === rule.targetOrderStatusId)
      ?.name ??
    String(rule.targetOrderStatusId ?? "")
  );
};

export const formatAutomationRuleSummary = (
  rule: AutomationRule,
  criteria: AutomationCriteria | null,
  t: TFunction,
): string => {
  const conditionsText = rule.conditions
    .map((condition) => {
      const sourceLabel = getAutomationSourceTypeLabel(condition.sourceType, t);
      const statusName = getConditionStatusName(condition, criteria);
      const delay =
        condition.durationLabel?.trim() ||
        (condition.durationValue != null && condition.durationUnit
          ? t("automation.delay.summary", {
              value: condition.durationValue,
              unit: t(
                `automation.delay.units.${condition.durationUnit.toLowerCase()}`,
              ),
            })
          : null);

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

  return t("automation.summary.full", {
    conditions: conditionsText,
    target: targetName,
  });
};
