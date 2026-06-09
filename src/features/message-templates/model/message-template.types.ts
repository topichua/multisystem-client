export type MessageTemplate = {
  id: number;
  workspaceId: number;
  name: string;
  template: string;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
};

export type MessageTemplateWritePayload = {
  name: string;
  template: string;
};
