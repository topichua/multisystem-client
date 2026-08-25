import {
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_CONDITION_TYPES,
  AUTOMATION_DURATION_UNITS,
  AUTOMATION_OPERATORS,
  AUTOMATION_SOURCE_TYPES,
  DEFAULT_AUTOMATION_ACTION_TYPE,
  DEFAULT_AUTOMATION_CONDITION_TYPE,
  DEFAULT_AUTOMATION_OPERATOR,
  type AutomationConversationGroupOption,
  type AutomationCriteria,
  type AutomationCriteriaOption,
  type AutomationRule,
  type AutomationRuleCondition,
  type AutomationRulesListResponse,
  type AutomationStatusOption,
  type AutomationTargetOrderStatus,
  type AutomationTemplateOption,
} from "./automation.types";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toOptionalNumber = (value: unknown): number | null => {
  if (value == null || value === "") {
    return null;
  }

  return toNumber(value);
};

const toOptionalStringId = (value: unknown): string | null =>
  toTrimmedString(value) || null;

const isAllowedValue = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value);

const normalizeEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (isAllowedValue(value, allowed) ? value : fallback);

const normalizeOptionalEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null => (isAllowedValue(value, allowed) ? value : null);

const normalizeList = <T>(
  value: unknown,
  normalizeItem: (item: unknown) => T | null,
): T[] =>
  Array.isArray(value)
    ? value.map(normalizeItem).filter((item): item is T => item != null)
    : [];

const normalizeNamedOption = <Id extends string | number>(
  value: unknown,
  parseId: (raw: unknown) => Id | null,
  options?: { requireName?: boolean },
): { id: Id; name: string; record: UnknownRecord } | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = parseId(value.id);
  const name = toTrimmedString(value.name);

  if (id == null) {
    return null;
  }

  if ((options?.requireName ?? true) && !name) {
    return null;
  }

  return { id, name, record: value };
};

const normalizeCriteriaOption = (
  value: unknown,
): AutomationCriteriaOption | null => {
  const option = normalizeNamedOption(value, toOptionalStringId);
  return option ? { id: option.id, name: option.name } : null;
};

const normalizeStatusOption = (
  value: unknown,
): AutomationStatusOption | null => {
  const option = normalizeNamedOption(value, toNumber);
  return option ? { id: option.id, name: option.name } : null;
};

const normalizeConversationGroupOption = (
  value: unknown,
): AutomationConversationGroupOption | null => {
  const option = normalizeNamedOption(value, toNumber, { requireName: false });

  if (!option) {
    return null;
  }

  const systemKey = toTrimmedString(option.record.systemKey) || null;

  return {
    id: option.id,
    name: option.name || systemKey || String(option.id),
    systemKey,
  };
};

const normalizeTemplateOption = (
  value: unknown,
): AutomationTemplateOption | null => {
  const option = normalizeNamedOption(value, toNumber);

  if (!option) {
    return null;
  }

  return {
    id: option.id,
    name: option.name,
    type: toTrimmedString(option.record.type) || undefined,
  };
};

const normalizeTargetOrderStatus = (
  value: unknown,
): AutomationTargetOrderStatus | null => {
  const option = normalizeNamedOption(value, toNumber);

  if (!option) {
    return null;
  }

  return {
    id: option.id,
    name: option.name,
    category: toTrimmedString(option.record.category) || undefined,
    color: toTrimmedString(option.record.color) || undefined,
  };
};

export const normalizeAutomationCriteria = (
  data: unknown,
): AutomationCriteria => {
  const record = isRecord(data) ? data : {};

  return {
    delivery: normalizeList(record.delivery, normalizeCriteriaOption),
    payment: normalizeList(record.payment, normalizeCriteriaOption),
    statuses: normalizeList(record.statuses, normalizeStatusOption),
    conversationGroups: normalizeList(
      record.conversationGroups,
      normalizeConversationGroupOption,
    ),
    orderTemplates: normalizeList(
      record.orderTemplates,
      normalizeTemplateOption,
    ),
  };
};

const normalizeCondition = (value: unknown): AutomationRuleCondition | null => {
  if (!isRecord(value)) {
    return null;
  }

  const sourceType = normalizeOptionalEnum(
    value.sourceType,
    AUTOMATION_SOURCE_TYPES,
  );
  const sourceStatus = toTrimmedString(value.sourceStatus);

  if (!sourceType || !sourceStatus) {
    return null;
  }

  return {
    id: toOptionalNumber(value.id) ?? undefined,
    sourceType,
    sourceStatus,
    operator: normalizeEnum(
      value.operator,
      AUTOMATION_OPERATORS,
      DEFAULT_AUTOMATION_OPERATOR,
    ),
    durationValue: toOptionalNumber(value.durationValue),
    durationUnit: normalizeOptionalEnum(
      value.durationUnit,
      AUTOMATION_DURATION_UNITS,
    ),
    durationLabel: toTrimmedString(value.durationLabel) || null,
  };
};

export const normalizeAutomationRule = (
  data: unknown,
): AutomationRule | null => {
  if (!isRecord(data)) {
    return null;
  }

  const id = toNumber(data.id);
  const name = toTrimmedString(data.name);

  if (id == null || !name) {
    return null;
  }

  const actionType = normalizeEnum(
    data.actionType,
    AUTOMATION_ACTION_TYPES,
    DEFAULT_AUTOMATION_ACTION_TYPE,
  );
  const conditions = normalizeList(data.conditions, normalizeCondition);

  const base = {
    id,
    name,
    isActive: data.isActive === true,
    conditionType: normalizeEnum(
      data.conditionType ?? data.condition_type,
      AUTOMATION_CONDITION_TYPES,
      DEFAULT_AUTOMATION_CONDITION_TYPE,
    ),
    conditions,
    createdAt: toTrimmedString(data.createdAt) || undefined,
    updatedAt: toTrimmedString(data.updatedAt) || undefined,
  };

  switch (actionType) {
    case "CHANGE_ORDER_STATUS": {
      const targetOrderStatusId = toOptionalNumber(data.targetOrderStatusId);

      if (targetOrderStatusId == null) {
        return null;
      }

      return {
        ...base,
        actionType,
        targetOrderStatusId,
        targetOrderStatus: normalizeTargetOrderStatus(data.targetOrderStatus),
      };
    }
    case "CHANGE_CONVERSATION_GROUP": {
      const targetConversationGroupId = toOptionalNumber(
        data.targetConversationGroupId,
      );

      if (targetConversationGroupId == null) {
        return null;
      }

      return {
        ...base,
        actionType,
        targetConversationGroupId,
        targetConversationGroup: normalizeConversationGroupOption(
          data.targetConversationGroup,
        ),
      };
    }
    case "SEND_MESSAGE": {
      const targetTemplateId = toOptionalNumber(data.targetTemplateId);

      if (targetTemplateId == null) {
        return null;
      }

      return {
        ...base,
        actionType,
        targetTemplateId,
        targetTemplate: normalizeTemplateOption(data.targetTemplate),
        actionDelayValue: toOptionalNumber(data.actionDelayValue),
        actionDelayUnit: normalizeOptionalEnum(
          data.actionDelayUnit,
          AUTOMATION_DURATION_UNITS,
        ),
        actionDelayLabel: toTrimmedString(data.actionDelayLabel) || null,
        waitForBusinessHours: data.waitForBusinessHours === true,
      };
    }
  }
};

export const normalizeAutomationRulesList = (
  data: unknown,
): AutomationRulesListResponse => {
  if (Array.isArray(data)) {
    return { items: normalizeList(data, normalizeAutomationRule) };
  }

  const record = isRecord(data) ? data : {};
  const rawItems = record.items ?? record.data;

  return { items: normalizeList(rawItems, normalizeAutomationRule) };
};
