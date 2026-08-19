import type {
  AutomationActionType,
  AutomationConditionType,
  AutomationOperator,
  AutomationRule,
  AutomationRuleConditionPayload,
  AutomationRuleCreatePayload,
  AutomationSourceType,
} from "@/features/automation/model/automation.types";

export const AT_BRANCH_SOURCE_STATUS = "at_branch";

export const DEFAULT_AUTOMATION_OPERATOR: AutomationOperator = "EQ";

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

export const createDefaultAutomationFormValues =
  (): AutomationRuleFormValues => ({
    name: "",
    isActive: true,
    actionType: "CHANGE_ORDER_STATUS",
    conditionType: "OR",
    conditions: [createEmptyCondition()],
    targetOrderStatusId: undefined,
    targetConversationGroupId: undefined,
  });

export const mapRuleToFormValues = (
  rule: AutomationRule,
): AutomationRuleFormValues => ({
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
});

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

  if (values.actionType === "CHANGE_CONVERSATION_GROUP") {
    return {
      name: values.name.trim(),
      isActive: values.isActive,
      conditionType: values.conditionType,
      conditions,
      actionType: "CHANGE_CONVERSATION_GROUP",
      targetConversationGroupId: values.targetConversationGroupId as number,
    };
  }

  return {
    name: values.name.trim(),
    isActive: values.isActive,
    conditionType: values.conditionType,
    conditions,
    actionType: "CHANGE_ORDER_STATUS",
    targetOrderStatusId: values.targetOrderStatusId as number,
  };
};
