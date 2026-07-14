import type {
  AutomationRule,
  AutomationRuleConditionPayload,
  AutomationRuleCreatePayload,
  AutomationSourceType,
} from "@/features/automation/model/automation.types";

export const AT_BRANCH_SOURCE_STATUS = "at_branch";

export type AutomationConditionFormValue = {
  sourceType: AutomationSourceType;
  sourceStatus?: string;
  durationValue?: number | null;
};

export type AutomationRuleFormValues = {
  name: string;
  isActive: boolean;
  actionType: "CHANGE_ORDER_STATUS";
  conditions: AutomationConditionFormValue[];
  targetOrderStatusId?: number;
};

export const isAtBranchCondition = (
  condition: Pick<AutomationConditionFormValue, "sourceType" | "sourceStatus">,
): boolean =>
  condition.sourceType === "DELIVERY_STATUS" &&
  condition.sourceStatus === AT_BRANCH_SOURCE_STATUS;

export const createEmptyCondition = (): AutomationConditionFormValue => ({
  sourceType: "DELIVERY_STATUS",
  sourceStatus: undefined,
  durationValue: null,
});

export const createDefaultAutomationFormValues =
  (): AutomationRuleFormValues => ({
    name: "",
    isActive: true,
    actionType: "CHANGE_ORDER_STATUS",
    conditions: [createEmptyCondition()],
    targetOrderStatusId: undefined,
  });

export const mapRuleToFormValues = (
  rule: AutomationRule,
): AutomationRuleFormValues => ({
  name: rule.name,
  isActive: rule.isActive,
  actionType: "CHANGE_ORDER_STATUS",
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
            durationValue: hasExtension ? condition.durationValue : null,
          };
        })
      : [createEmptyCondition()],
  targetOrderStatusId: rule.targetOrderStatusId,
});

export const buildAutomationCreatePayload = (
  values: AutomationRuleFormValues,
): AutomationRuleCreatePayload => ({
  name: values.name.trim(),
  isActive: values.isActive,
  conditions: values.conditions.map(
    (condition): AutomationRuleConditionPayload => {
      const payload: AutomationRuleConditionPayload = {
        sourceType: condition.sourceType,
        sourceStatus: condition.sourceStatus ?? "",
      };

      if (isAtBranchCondition(condition) && condition.durationValue != null) {
        payload.durationValue = condition.durationValue;
        payload.durationUnit = "DAYS";
      }

      return payload;
    },
  ),
  actionType: "CHANGE_ORDER_STATUS",
  targetOrderStatusId: values.targetOrderStatusId as number,
});
