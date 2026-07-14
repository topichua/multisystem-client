import type { TFunction } from "i18next";

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

  return t("automation.sourceType.payment");
};

export const getConditionStatusName = (
  condition: AutomationRuleCondition,
  criteria: AutomationCriteria | null,
): string => {
  const options =
    condition.sourceType === "DELIVERY_STATUS"
      ? criteria?.delivery
      : criteria?.payment;

  return (
    options?.find((item) => item.id === condition.sourceStatus)?.name ??
    condition.sourceStatus
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

      const base = t("automation.summary.condition", {
        source: sourceLabel,
        status: statusName,
      });

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

  const targetName =
    rule.targetOrderStatus?.name ??
    criteria?.statuses.find((item) => item.id === rule.targetOrderStatusId)
      ?.name ??
    String(rule.targetOrderStatusId);

  return t("automation.summary.full", {
    conditions: conditionsText,
    target: targetName,
  });
};
