export const MESSAGE_TEMPLATE_TYPES = ["chat", "order"] as const;

export type MessageTemplateType = (typeof MESSAGE_TEMPLATE_TYPES)[number];

export const MESSAGE_TEMPLATE_LIST_FILTERS = [
  "all",
  ...MESSAGE_TEMPLATE_TYPES,
] as const;

export type MessageTemplateListFilter =
  (typeof MESSAGE_TEMPLATE_LIST_FILTERS)[number];

export const DEFAULT_MESSAGE_TEMPLATE_TYPE: MessageTemplateType = "chat";

export type MessageTemplate = {
  id: number;
  workspaceId: number;
  name: string;
  template: string;
  type: MessageTemplateType;
  isActive: boolean;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
};

export type MessageTemplateWritePayload = {
  type: MessageTemplateType;
  name: string;
  template: string;
  isActive: boolean;
};

export type MessageTemplateVariable = {
  key: string;
  placeholder: string;
};

export type MessageTemplateVariablesGroup = {
  type: MessageTemplateType;
  variables: MessageTemplateVariable[];
};

export type MessageTemplateRenderPayload = {
  conversationId?: number;
  orderId?: number;
};

export type MessageTemplateRenderResult = {
  templateId: number;
  type: MessageTemplateType;
  text: string;
  variables: Record<string, string>;
};
