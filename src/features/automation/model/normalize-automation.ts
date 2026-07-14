import type {
  AutomationActionType,
  AutomationConditionType,
  AutomationCriteria,
  AutomationCriteriaOption,
  AutomationDurationUnit,
  AutomationRule,
  AutomationRuleCondition,
  AutomationRulesListResponse,
  AutomationSourceType,
  AutomationStatusOption,
  AutomationTargetOrderStatus,
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

const ACTION_TYPES = new Set<AutomationActionType>(["CHANGE_ORDER_STATUS"]);

const SOURCE_TYPES = new Set<AutomationSourceType>([
  "DELIVERY_STATUS",
  "PAYMENT_STATUS",
]);

const DURATION_UNITS = new Set<AutomationDurationUnit>([
  "MINUTES",
  "HOURS",
  "DAYS",
]);

const CONDITION_TYPES = new Set<AutomationConditionType>(["AND", "OR"]);

const normalizeActionType = (value: unknown): AutomationActionType =>
  typeof value === "string" && ACTION_TYPES.has(value as AutomationActionType)
    ? (value as AutomationActionType)
    : "CHANGE_ORDER_STATUS";

const normalizeConditionType = (value: unknown): AutomationConditionType =>
  typeof value === "string" &&
  CONDITION_TYPES.has(value as AutomationConditionType)
    ? (value as AutomationConditionType)
    : "OR";

const normalizeSourceType = (value: unknown): AutomationSourceType | null => {
  if (
    typeof value === "string" &&
    SOURCE_TYPES.has(value as AutomationSourceType)
  ) {
    return value as AutomationSourceType;
  }

  return null;
};

const normalizeDurationUnit = (
  value: unknown,
): AutomationDurationUnit | null => {
  if (
    typeof value === "string" &&
    DURATION_UNITS.has(value as AutomationDurationUnit)
  ) {
    return value as AutomationDurationUnit;
  }

  return null;
};

const normalizeCriteriaOption = (
  value: unknown,
): AutomationCriteriaOption | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toTrimmedString(value.id);
  const name = toTrimmedString(value.name);

  if (!id || !name) {
    return null;
  }

  return { id, name };
};

const normalizeStatusOption = (
  value: unknown,
): AutomationStatusOption | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id);
  const name = toTrimmedString(value.name);

  if (id == null || !name) {
    return null;
  }

  return { id, name };
};

export const normalizeAutomationCriteria = (
  data: unknown,
): AutomationCriteria => {
  const record = isRecord(data) ? data : {};

  return {
    delivery: Array.isArray(record.delivery)
      ? record.delivery
          .map(normalizeCriteriaOption)
          .filter((item): item is AutomationCriteriaOption => item != null)
      : [],
    payment: Array.isArray(record.payment)
      ? record.payment
          .map(normalizeCriteriaOption)
          .filter((item): item is AutomationCriteriaOption => item != null)
      : [],
    statuses: Array.isArray(record.statuses)
      ? record.statuses
          .map(normalizeStatusOption)
          .filter((item): item is AutomationStatusOption => item != null)
      : [],
  };
};

const normalizeTargetOrderStatus = (
  value: unknown,
): AutomationTargetOrderStatus | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = toNumber(value.id);
  const name = toTrimmedString(value.name);

  if (id == null || !name) {
    return null;
  }

  return {
    id,
    name,
    category: toTrimmedString(value.category) || undefined,
    color: toTrimmedString(value.color) || undefined,
  };
};

const normalizeCondition = (value: unknown): AutomationRuleCondition | null => {
  if (!isRecord(value)) {
    return null;
  }

  const sourceType = normalizeSourceType(value.sourceType);
  const sourceStatus = toTrimmedString(value.sourceStatus);

  if (!sourceType || !sourceStatus) {
    return null;
  }

  return {
    id: toOptionalNumber(value.id) ?? undefined,
    sourceType,
    sourceStatus,
    durationValue: toOptionalNumber(value.durationValue),
    durationUnit: normalizeDurationUnit(value.durationUnit),
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
  const targetOrderStatusId = toNumber(data.targetOrderStatusId);
  const conditions = Array.isArray(data.conditions)
    ? data.conditions
        .map(normalizeCondition)
        .filter((item): item is AutomationRuleCondition => item != null)
    : [];

  if (id == null || !name || targetOrderStatusId == null) {
    return null;
  }

  return {
    id,
    name,
    isActive: data.isActive === true,
    actionType: normalizeActionType(data.actionType),
    conditionType: normalizeConditionType(
      data.conditionType ?? data.condition_type,
    ),
    targetOrderStatusId,
    targetOrderStatus: normalizeTargetOrderStatus(data.targetOrderStatus),
    conditions,
    createdAt: toTrimmedString(data.createdAt) || undefined,
    updatedAt: toTrimmedString(data.updatedAt) || undefined,
  };
};

export const normalizeAutomationRulesList = (
  data: unknown,
): AutomationRulesListResponse => {
  if (Array.isArray(data)) {
    const items = data
      .map(normalizeAutomationRule)
      .filter((item): item is AutomationRule => item != null);

    return { items };
  }

  const record = isRecord(data) ? data : {};
  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.data)
      ? record.data
      : [];

  const items = rawItems
    .map(normalizeAutomationRule)
    .filter((item): item is AutomationRule => item != null);

  return { items };
};
