export type AutomationActionType = "CHANGE_ORDER_STATUS";

export type AutomationSourceType = "DELIVERY_STATUS" | "PAYMENT_STATUS";

export type AutomationConditionType = "AND" | "OR";

export type AutomationDurationUnit = "MINUTES" | "HOURS" | "DAYS";

export type AutomationCriteriaOption = {
  id: string;
  name: string;
};

export type AutomationStatusOption = {
  id: number;
  name: string;
};

export type AutomationCriteria = {
  delivery: AutomationCriteriaOption[];
  payment: AutomationCriteriaOption[];
  statuses: AutomationStatusOption[];
};

export type AutomationRuleCondition = {
  id?: number;
  sourceType: AutomationSourceType;
  sourceStatus: string;
  durationValue?: number | null;
  durationUnit?: AutomationDurationUnit | null;
  durationLabel?: string | null;
};

export type AutomationTargetOrderStatus = {
  id: number;
  name: string;
  category?: string;
  color?: string;
};

export type AutomationRule = {
  id: number;
  name: string;
  isActive: boolean;
  actionType: AutomationActionType;
  conditionType: AutomationConditionType;
  targetOrderStatusId: number;
  targetOrderStatus?: AutomationTargetOrderStatus | null;
  conditions: AutomationRuleCondition[];
  createdAt?: string;
  updatedAt?: string;
};

export type AutomationRuleConditionPayload = {
  sourceType: AutomationSourceType;
  sourceStatus: string;
  durationValue?: number;
  durationUnit?: AutomationDurationUnit;
};

export type AutomationRuleCreatePayload = {
  name: string;
  isActive: boolean;
  conditions: AutomationRuleConditionPayload[];
  conditionType: AutomationConditionType;
  actionType: AutomationActionType;
  targetOrderStatusId: number;
};

export type AutomationRuleUpdatePayload = Partial<{
  name: string;
  isActive: boolean;
  conditions: AutomationRuleConditionPayload[];
  conditionType: AutomationConditionType;
  actionType: AutomationActionType;
  targetOrderStatusId: number;
}>;

export type AutomationRulesListParams = {
  isActive?: boolean;
  sourceType?: AutomationSourceType;
};

export type AutomationRulesListResponse = {
  items: AutomationRule[];
};
