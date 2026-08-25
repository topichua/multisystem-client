import type {
  AutomationCriteria,
  AutomationSourceType,
} from "./automation.types";

export type AutomationSourceStatusOption = {
  id: string;
  name: string;
};

export const getAutomationSourceStatusOptions = (
  sourceType: AutomationSourceType | undefined,
  criteria: AutomationCriteria | null,
): AutomationSourceStatusOption[] => {
  if (sourceType === "PAYMENT_STATUS") {
    return (criteria?.payment ?? []).map((option) => ({
      id: option.id,
      name: option.name,
    }));
  }

  if (sourceType === "ORDER_STATUS") {
    return (criteria?.statuses ?? []).map((option) => ({
      id: String(option.id),
      name: option.name,
    }));
  }

  return (criteria?.delivery ?? []).map((option) => ({
    id: option.id,
    name: option.name,
  }));
};

export const getAutomationConditionStatusName = (
  condition: {
    sourceType: AutomationSourceType;
    sourceStatus: string;
  },
  criteria: AutomationCriteria | null,
): string =>
  getAutomationSourceStatusOptions(condition.sourceType, criteria).find(
    (item) => item.id === condition.sourceStatus,
  )?.name ?? condition.sourceStatus;
