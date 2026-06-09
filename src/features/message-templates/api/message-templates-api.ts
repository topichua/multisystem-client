import { apiClient } from "@/api/api-client";

import type {
  MessageTemplate,
  MessageTemplateWritePayload,
} from "../model/message-template.types";

const basePath = "/workplace/templates";

function isMessageTemplate(value: unknown): value is MessageTemplate {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "template" in value &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.template === "string"
  );
}

export const messageTemplatesApi = {
  list: async (): Promise<MessageTemplate[]> => {
    const { data } = await apiClient.get<MessageTemplate[]>(basePath);
    return Array.isArray(data) ? data : [];
  },

  get: async (templateId: number): Promise<MessageTemplate> => {
    const { data } = await apiClient.get<MessageTemplate>(
      `${basePath}/${templateId}`,
    );
    return data;
  },

  create: async (
    payload: MessageTemplateWritePayload,
  ): Promise<MessageTemplate | null> => {
    const { data } = await apiClient.post<unknown>(basePath, payload);
    return isMessageTemplate(data) ? data : null;
  },

  update: async (
    templateId: number,
    payload: MessageTemplateWritePayload,
  ): Promise<MessageTemplate | null> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${templateId}`,
      payload,
    );
    return isMessageTemplate(data) ? data : null;
  },

  delete: async (templateId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${templateId}`);
  },
};
