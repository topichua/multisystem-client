import {
  DEFAULT_AUTOMATION_ACTION_TYPE,
  DEFAULT_AUTOMATION_CONDITION_TYPE,
  DEFAULT_AUTOMATION_DURATION_UNIT,
  DEFAULT_AUTOMATION_OPERATOR,
  DEFAULT_AUTOMATION_SOURCE_TYPE,
  type AutomationActionType,
  type AutomationConditionType,
  type AutomationDurationUnit,
  type AutomationOperator,
  type AutomationRule,
  type AutomationRuleConditionPayload,
  type AutomationRulePayload,
  type AutomationSourceType,
} from "@/features/automation/model/automation.types";

export const AT_BRANCH_SOURCE_STATUS = "at_branch";

export const ACTION_DELAY_NONE = "NONE";

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

const isOrderStatusEqualsTarget = (
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

export const hasEqSameAsTargetConflict = (
  actionType: AutomationActionType,
  conditions: AutomationConditionFormValue[] | undefined,
  targetOrderStatusId?: number,
): boolean =>
  actionType === "CHANGE_ORDER_STATUS" &&
  (conditions ?? []).some((condition) =>
    isOrderStatusEqualsTarget(condition, targetOrderStatusId),
  );

export const createEmptyCondition = (): AutomationConditionFormValue => ({
  sourceType: DEFAULT_AUTOMATION_SOURCE_TYPE,
  sourceStatus: undefined,
  operator: DEFAULT_AUTOMATION_OPERATOR,
  durationValue: null,
});

export const createDefaultSendMessageActionValues = (): Pick<
  AutomationRuleFormValues,
  "actionDelayValue" | "actionDelayUnit" | "waitForBusinessHours"
> => ({
  actionDelayValue: 1,
  actionDelayUnit: DEFAULT_AUTOMATION_DURATION_UNIT,
  waitForBusinessHours: true,
});

export const createDefaultAutomationFormValues =
  (): AutomationRuleFormValues => ({
    name: "",
    isActive: true,
    actionType: DEFAULT_AUTOMATION_ACTION_TYPE,
    conditionType: DEFAULT_AUTOMATION_CONDITION_TYPE,
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
  const conditions =
    rule.conditions.length > 0
      ? rule.conditions.map((condition) => {
          const hasExtension =
            isAtBranchCondition(condition) &&
            condition.durationValue != null &&
            condition.durationUnit === DEFAULT_AUTOMATION_DURATION_UNIT;

          return {
            sourceType: condition.sourceType,
            sourceStatus: condition.sourceStatus,
            operator: condition.operator ?? DEFAULT_AUTOMATION_OPERATOR,
            durationValue: hasExtension ? condition.durationValue : null,
          };
        })
      : [createEmptyCondition()];

  const shared = {
    name: rule.name,
    isActive: rule.isActive,
    conditionType: rule.conditionType,
    conditions,
  };

  switch (rule.actionType) {
    case "CHANGE_ORDER_STATUS":
      return {
        ...createDefaultAutomationFormValues(),
        ...shared,
        actionType: rule.actionType,
        targetOrderStatusId: rule.targetOrderStatusId,
      };
    case "CHANGE_CONVERSATION_GROUP":
      return {
        ...createDefaultAutomationFormValues(),
        ...shared,
        actionType: rule.actionType,
        targetConversationGroupId: rule.targetConversationGroupId,
      };
    case "SEND_MESSAGE": {
      const hasActionDelay =
        rule.actionDelayValue != null && rule.actionDelayUnit != null;

      return {
        ...createDefaultAutomationFormValues(),
        ...shared,
        actionType: rule.actionType,
        targetTemplateId: rule.targetTemplateId,
        actionDelayValue: hasActionDelay ? rule.actionDelayValue : null,
        actionDelayUnit: hasActionDelay
          ? rule.actionDelayUnit
          : ACTION_DELAY_NONE,
        waitForBusinessHours: rule.waitForBusinessHours === true,
      };
    }
  }
};

export const buildAutomationRulePayload = (
  values: AutomationRuleFormValues,
): AutomationRulePayload => {
  const conditions = values.conditions.map(
    (condition): AutomationRuleConditionPayload => {
      const payload: AutomationRuleConditionPayload = {
        sourceType: condition.sourceType,
        sourceStatus: condition.sourceStatus ?? "",
        operator: condition.operator ?? DEFAULT_AUTOMATION_OPERATOR,
      };

      if (isAtBranchCondition(condition) && condition.durationValue != null) {
        payload.durationValue = condition.durationValue;
        payload.durationUnit = DEFAULT_AUTOMATION_DURATION_UNIT;
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

  switch (values.actionType) {
    case "CHANGE_CONVERSATION_GROUP":
      return {
        ...base,
        actionType: "CHANGE_CONVERSATION_GROUP",
        targetConversationGroupId: values.targetConversationGroupId as number,
      };
    case "SEND_MESSAGE": {
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
    case "CHANGE_ORDER_STATUS":
      return {
        ...base,
        actionType: "CHANGE_ORDER_STATUS",
        targetOrderStatusId: values.targetOrderStatusId as number,
      };
  }
};
