export const AUTOMATION_ACTION_TYPES = [
  "CHANGE_ORDER_STATUS",
  "CHANGE_CONVERSATION_GROUP",
  "SEND_MESSAGE",
] as const;

export type AutomationActionType = (typeof AUTOMATION_ACTION_TYPES)[number];

export const AUTOMATION_SOURCE_TYPES = [
  "DELIVERY_STATUS",
  "PAYMENT_STATUS",
  "ORDER_STATUS",
] as const;

export type AutomationSourceType = (typeof AUTOMATION_SOURCE_TYPES)[number];

export const AUTOMATION_OPERATORS = ["EQ", "NEQ"] as const;

export type AutomationOperator = (typeof AUTOMATION_OPERATORS)[number];

export const AUTOMATION_CONDITION_TYPES = ["AND", "OR"] as const;

export type AutomationConditionType =
  (typeof AUTOMATION_CONDITION_TYPES)[number];

export const AUTOMATION_DURATION_UNITS = ["MINUTES", "HOURS", "DAYS"] as const;

export type AutomationDurationUnit = (typeof AUTOMATION_DURATION_UNITS)[number];

export const DEFAULT_AUTOMATION_ACTION_TYPE: AutomationActionType =
  "CHANGE_ORDER_STATUS";

export const DEFAULT_AUTOMATION_SOURCE_TYPE: AutomationSourceType =
  "DELIVERY_STATUS";

export const DEFAULT_AUTOMATION_OPERATOR: AutomationOperator = "EQ";

export const DEFAULT_AUTOMATION_CONDITION_TYPE: AutomationConditionType = "OR";

export const DEFAULT_AUTOMATION_DURATION_UNIT: AutomationDurationUnit = "DAYS";

export const AUTOMATION_SOURCE_TYPE_LABEL_KEYS = {
  DELIVERY_STATUS: "automation.sourceType.delivery",
  PAYMENT_STATUS: "automation.sourceType.payment",
  ORDER_STATUS: "automation.sourceType.order",
} as const satisfies Record<AutomationSourceType, string>;

export const AUTOMATION_OPERATOR_LABEL_KEYS = {
  EQ: "automation.operator.eq",
  NEQ: "automation.operator.neq",
} as const satisfies Record<AutomationOperator, string>;

export const AUTOMATION_ACTION_TYPE_LABEL_KEYS = {
  CHANGE_ORDER_STATUS: "automation.actionType.changeOrderStatus",
  CHANGE_CONVERSATION_GROUP: "automation.actionType.changeConversationGroup",
  SEND_MESSAGE: "automation.actionType.sendMessage",
} as const satisfies Record<AutomationActionType, string>;

export const AUTOMATION_ACTION_LABEL_KEYS = {
  CHANGE_ORDER_STATUS: "automation.action.changeOrderStatus",
  CHANGE_CONVERSATION_GROUP: "automation.action.changeConversationGroup",
  SEND_MESSAGE: "automation.action.sendMessage",
} as const satisfies Record<AutomationActionType, string>;

export const AUTOMATION_DURATION_MODE_LABEL_KEYS = {
  MINUTES: "automation.delay.modes.minutes",
  HOURS: "automation.delay.modes.hours",
  DAYS: "automation.delay.modes.days",
} as const satisfies Record<AutomationDurationUnit, string>;

export const AUTOMATION_DURATION_UNIT_LABEL_KEYS = {
  MINUTES: "automation.delay.units.minutes",
  HOURS: "automation.delay.units.hours",
  DAYS: "automation.delay.units.days",
} as const satisfies Record<AutomationDurationUnit, string>;

export const AUTOMATION_DURATION_AFTER_TRIGGER_LABEL_KEYS = {
  MINUTES: "automation.delay.afterTriggerUnits.minutes",
  HOURS: "automation.delay.afterTriggerUnits.hours",
  DAYS: "automation.delay.afterTriggerUnits.days",
} as const satisfies Record<AutomationDurationUnit, string>;

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

export type AutomationTemplateOption = {
  id: number;
  name: string;
  type?: string;
};

export type AutomationCriteria = {
  delivery: AutomationCriteriaOption[];
  payment: AutomationCriteriaOption[];
  statuses: AutomationStatusOption[];
  conversationGroups: AutomationConversationGroupOption[];
  orderTemplates: AutomationTemplateOption[];
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

type AutomationChangeOrderStatusAction = {
  actionType: "CHANGE_ORDER_STATUS";
  targetOrderStatusId: number;
};

type AutomationChangeConversationGroupAction = {
  actionType: "CHANGE_CONVERSATION_GROUP";
  targetConversationGroupId: number;
};

type AutomationSendMessageAction = {
  actionType: "SEND_MESSAGE";
  targetTemplateId: number;
  actionDelayValue?: number | null;
  actionDelayUnit?: AutomationDurationUnit | null;
  waitForBusinessHours?: boolean;
};

type AutomationRuleAction =
  | AutomationChangeOrderStatusAction
  | AutomationChangeConversationGroupAction
  | AutomationSendMessageAction;

type AutomationRuleBase = {
  id: number;
  name: string;
  isActive: boolean;
  conditionType: AutomationConditionType;
  conditions: AutomationRuleCondition[];
  createdAt?: string;
  updatedAt?: string;
};

export type AutomationRule = AutomationRuleBase &
  (
    | (AutomationChangeOrderStatusAction & {
        targetOrderStatus?: AutomationTargetOrderStatus | null;
      })
    | (AutomationChangeConversationGroupAction & {
        targetConversationGroup?: AutomationConversationGroupOption | null;
      })
    | (AutomationSendMessageAction & {
        targetTemplate?: AutomationTemplateOption | null;
        actionDelayLabel?: string | null;
      })
  );

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

export type AutomationRulePayload = AutomationRulePayloadBase &
  AutomationRuleAction;

export type AutomationRulesListParams = {
  isActive?: boolean;
  sourceType?: AutomationSourceType;
};

export type AutomationRulesListResponse = {
  items: AutomationRule[];
};
