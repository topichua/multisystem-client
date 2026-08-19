export type AutomationActionType =
  "CHANGE_ORDER_STATUS" | "CHANGE_CONVERSATION_GROUP";

export type AutomationSourceType =
  "DELIVERY_STATUS" | "PAYMENT_STATUS" | "ORDER_STATUS";

export type AutomationOperator = "EQ" | "NEQ";

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

export type AutomationConversationGroupOption = {
  id: number;
  name: string;
  systemKey?: string | null;
};

export type AutomationCriteria = {
  delivery: AutomationCriteriaOption[];
  payment: AutomationCriteriaOption[];
  statuses: AutomationStatusOption[];
  conversationGroups: AutomationConversationGroupOption[];
};

export type AutomationRuleCondition = {
  id?: number;
  sourceType: AutomationSourceType;
  sourceStatus: string;
  operator: AutomationOperator;
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
  targetOrderStatusId?: number | null;
  targetOrderStatus?: AutomationTargetOrderStatus | null;
  targetConversationGroupId?: number | null;
  targetConversationGroup?: AutomationConversationGroupOption | null;
  conditions: AutomationRuleCondition[];
  createdAt?: string;
  updatedAt?: string;
};

export type AutomationRuleConditionPayload = {
  sourceType: AutomationSourceType;
  sourceStatus: string;
  operator: AutomationOperator;
  durationValue?: number;
  durationUnit?: AutomationDurationUnit;
};

type AutomationRulePayloadBase = {
  name: string;
  isActive: boolean;
  conditions: AutomationRuleConditionPayload[];
  conditionType: AutomationConditionType;
};

export type AutomationRuleCreatePayload = AutomationRulePayloadBase &
  (
    | {
        actionType: "CHANGE_ORDER_STATUS";
        targetOrderStatusId: number;
      }
    | {
        actionType: "CHANGE_CONVERSATION_GROUP";
        targetConversationGroupId: number;
      }
  );

export type AutomationRuleUpdatePayload = Partial<{
  name: string;
  isActive: boolean;
  conditions: AutomationRuleConditionPayload[];
  conditionType: AutomationConditionType;
  actionType: AutomationActionType;
  targetOrderStatusId: number | null;
  targetConversationGroupId: number | null;
}>;

export type AutomationRulesListParams = {
  isActive?: boolean;
  sourceType?: AutomationSourceType;
};

export type AutomationRulesListResponse = {
  items: AutomationRule[];
};
