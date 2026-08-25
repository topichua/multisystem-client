import type {
  AutomationActionType,
  AutomationConditionType,
  AutomationDurationUnit,
  AutomationOperator,
  AutomationRule,
  AutomationRuleConditionPayload,
  AutomationRuleCreatePayload,
  AutomationSourceType,
} from "@/features/automation/model/automation.types";

export const AT_BRANCH_SOURCE_STATUS = "at_branch";

export const DEFAULT_AUTOMATION_OPERATOR: AutomationOperator = "EQ";

export const DEFAULT_ACTION_DELAY_UNIT: AutomationDurationUnit = "DAYS";

export const ACTION_DELAY_NONE = "NONE";

export const ACTION_DELAY_UNITS: AutomationDurationUnit[] = [
  "MINUTES",
  "HOURS",
  "DAYS",
];

export type AutomationActionDelayUnitValue =
  AutomationDurationUnit | typeof ACTION_DELAY_NONE;

export type AutomationConditionFormValue = {
  sourceType: AutomationSourceType;
  sourceStatus?: string;
  operator: AutomationOperator;
  durationValue?: number | null;
};

export type AutomationRuleFormValues = {
  name: string;
  isActive: boolean;
  actionType: AutomationActionType;
  conditionType: AutomationConditionType;
  conditions: AutomationConditionFormValue[];
  targetOrderStatusId?: number;
  targetConversationGroupId?: number;
  targetTemplateId?: number;
  actionDelayValue?: number | null;
  actionDelayUnit?: AutomationActionDelayUnitValue | null;
  waitForBusinessHours: boolean;
};

export const isAtBranchCondition = (
  condition: Pick<AutomationConditionFormValue, "sourceType" | "sourceStatus">,
): boolean =>
  condition.sourceType === "DELIVERY_STATUS" &&
  condition.sourceStatus === AT_BRANCH_SOURCE_STATUS;

export const isOrderStatusEqualsTarget = (
  condition: Pick<
    AutomationConditionFormValue,
    "sourceType" | "sourceStatus" | "operator"
  >,
  targetOrderStatusId?: number,
): boolean =>
  condition.sourceType === "ORDER_STATUS" &&
  (condition.operator ?? DEFAULT_AUTOMATION_OPERATOR) === "EQ" &&
  targetOrderStatusId != null &&
  condition.sourceStatus === String(targetOrderStatusId);

export const createEmptyCondition = (): AutomationConditionFormValue => ({
  sourceType: "DELIVERY_STATUS",
  sourceStatus: undefined,
  operator: DEFAULT_AUTOMATION_OPERATOR,
  durationValue: null,
});

export const createDefaultSendMessageActionValues = (): Pick<
  AutomationRuleFormValues,
  "actionDelayValue" | "actionDelayUnit" | "waitForBusinessHours"
> => ({
  actionDelayValue: 1,
  actionDelayUnit: DEFAULT_ACTION_DELAY_UNIT,
  waitForBusinessHours: true,
});

export const createDefaultAutomationFormValues =
  (): AutomationRuleFormValues => ({
    name: "",
    isActive: true,
    actionType: "CHANGE_ORDER_STATUS",
    conditionType: "OR",
    conditions: [createEmptyCondition()],
    targetOrderStatusId: undefined,
    targetConversationGroupId: undefined,
    targetTemplateId: undefined,
    actionDelayValue: null,
    actionDelayUnit: ACTION_DELAY_NONE,
    waitForBusinessHours: false,
  });

export const mapRuleToFormValues = (
  rule: AutomationRule,
): AutomationRuleFormValues => {
  const hasActionDelay =
    rule.actionType === "SEND_MESSAGE" &&
    rule.actionDelayValue != null &&
    rule.actionDelayUnit != null;

  return {
    name: rule.name,
    isActive: rule.isActive,
    actionType: rule.actionType,
    conditionType: rule.conditionType,
    conditions:
      rule.conditions.length > 0
        ? rule.conditions.map((condition) => {
            const hasExtension =
              isAtBranchCondition(condition) &&
              condition.durationValue != null &&
              condition.durationUnit === "DAYS";

            return {
              sourceType: condition.sourceType,
              sourceStatus: condition.sourceStatus,
              operator: condition.operator ?? DEFAULT_AUTOMATION_OPERATOR,
              durationValue: hasExtension ? condition.durationValue : null,
            };
          })
        : [createEmptyCondition()],
    targetOrderStatusId: rule.targetOrderStatusId ?? undefined,
    targetConversationGroupId: rule.targetConversationGroupId ?? undefined,
    targetTemplateId: rule.targetTemplateId ?? undefined,
    actionDelayValue: hasActionDelay ? rule.actionDelayValue : null,
    actionDelayUnit: hasActionDelay ? rule.actionDelayUnit : ACTION_DELAY_NONE,
    waitForBusinessHours:
      rule.actionType === "SEND_MESSAGE"
        ? rule.waitForBusinessHours === true
        : false,
  };
};

export const buildAutomationCreatePayload = (
  values: AutomationRuleFormValues,
): AutomationRuleCreatePayload => {
  const conditions = values.conditions.map(
    (condition): AutomationRuleConditionPayload => {
      const payload: AutomationRuleConditionPayload = {
        sourceType: condition.sourceType,
        sourceStatus: condition.sourceStatus ?? "",
        operator: condition.operator ?? DEFAULT_AUTOMATION_OPERATOR,
      };

      if (isAtBranchCondition(condition) && condition.durationValue != null) {
        payload.durationValue = condition.durationValue;
        payload.durationUnit = "DAYS";
      }

      return payload;
    },
  );

  const base = {
    name: values.name.trim(),
    isActive: values.isActive,
    conditionType: values.conditionType,
    conditions,
  };

  if (values.actionType === "CHANGE_CONVERSATION_GROUP") {
    return {
      ...base,
      actionType: "CHANGE_CONVERSATION_GROUP",
      targetConversationGroupId: values.targetConversationGroupId as number,
    };
  }

  if (values.actionType === "SEND_MESSAGE") {
    const hasDelay =
      values.actionDelayUnit != null &&
      values.actionDelayUnit !== ACTION_DELAY_NONE &&
      values.actionDelayValue != null;

    return {
      ...base,
      actionType: "SEND_MESSAGE",
      targetTemplateId: values.targetTemplateId as number,
      actionDelayValue: hasDelay ? values.actionDelayValue : null,
      actionDelayUnit: hasDelay
        ? (values.actionDelayUnit as AutomationDurationUnit)
        : null,
      waitForBusinessHours: values.waitForBusinessHours === true,
    };
  }

  return {
    ...base,
    actionType: "CHANGE_ORDER_STATUS",
    targetOrderStatusId: values.targetOrderStatusId as number,
  };
};
