import {
  DEFAULT_MESSAGE_TEMPLATE_TYPE,
  MESSAGE_TEMPLATE_TYPES,
  type MessageTemplate,
  type MessageTemplateType,
  type MessageTemplateVariable,
  type MessageTemplateVariablesGroup,
  type MessageTemplateRenderResult,
} from "./message-template.types";

export function isMessageTemplateType(
  value: unknown,
): value is MessageTemplateType {
  return (
    typeof value === "string" &&
    MESSAGE_TEMPLATE_TYPES.includes(value as MessageTemplateType)
  );
}

export function toMessageTemplateType(value: unknown): MessageTemplateType {
  return isMessageTemplateType(value) ? value : DEFAULT_MESSAGE_TEMPLATE_TYPE;
}

export function toMessageTemplate(value: unknown): MessageTemplate | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "number" ||
    typeof record.name !== "string" ||
    typeof record.template !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    workspaceId:
      typeof record.workspaceId === "number" ? record.workspaceId : 0,
    name: record.name,
    template: record.template,
    type: toMessageTemplateType(record.type),
    isActive: typeof record.isActive === "boolean" ? record.isActive : true,
    createdById:
      typeof record.createdById === "number" ? record.createdById : 0,
    updatedById:
      typeof record.updatedById === "number" ? record.updatedById : 0,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : "",
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
  };
}

export function toMessageTemplateVariable(
  value: unknown,
): MessageTemplateVariable | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.key !== "string" ||
    typeof record.placeholder !== "string"
  ) {
    return null;
  }

  return {
    key: record.key,
    placeholder: record.placeholder,
  };
}

export function toMessageTemplateVariablesGroups(
  value: unknown,
): MessageTemplateVariablesGroup[] {
  if (typeof value !== "object" || value === null) {
    return [];
  }

  const types = (value as Record<string, unknown>).types;

  if (!Array.isArray(types)) {
    return [];
  }

  return types.flatMap((group) => {
    if (typeof group !== "object" || group === null) {
      return [];
    }

    const record = group as Record<string, unknown>;

    if (!isMessageTemplateType(record.type)) {
      return [];
    }

    const type = record.type;
    const variables = Array.isArray(record.variables)
      ? record.variables
          .map(toMessageTemplateVariable)
          .filter((item): item is MessageTemplateVariable => item !== null)
      : [];

    return [{ type, variables }];
  });
}

export function getVariableGroupKey(variable: MessageTemplateVariable): string {
  const separatorIndex = variable.key.indexOf(".");

  return separatorIndex === -1
    ? variable.key
    : variable.key.slice(0, separatorIndex);
}

export function groupTemplateVariables(
  variables: MessageTemplateVariable[],
): { key: string; variables: MessageTemplateVariable[] }[] {
  const groupOrder: string[] = [];
  const grouped = new Map<string, MessageTemplateVariable[]>();

  for (const variable of variables) {
    const groupKey = getVariableGroupKey(variable);
    const existing = grouped.get(groupKey);

    if (existing == null) {
      groupOrder.push(groupKey);
      grouped.set(groupKey, [variable]);
      continue;
    }

    existing.push(variable);
  }

  return groupOrder.map((key) => ({
    key,
    variables: grouped.get(key) ?? [],
  }));
}

export function toVariablesByType(
  groups: MessageTemplateVariablesGroup[],
): Record<MessageTemplateType, MessageTemplateVariable[]> {
  return {
    chat: groups.find((group) => group.type === "chat")?.variables ?? [],
    order: groups.find((group) => group.type === "order")?.variables ?? [],
  };
}

function toRenderVariables(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export function toMessageTemplateRenderResult(
  value: unknown,
): MessageTemplateRenderResult | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.text !== "string") {
    return null;
  }

  return {
    templateId: typeof record.templateId === "number" ? record.templateId : 0,
    type: toMessageTemplateType(record.type),
    text: record.text,
    variables: toRenderVariables(record.variables),
  };
}
