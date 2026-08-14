import { apiClient } from "@/api/api-client";

import type {
  MessageTemplate,
  MessageTemplateRenderPayload,
  MessageTemplateRenderResult,
  MessageTemplateType,
  MessageTemplateVariablesGroup,
  MessageTemplateWritePayload,
} from "../model/message-template.types";
import {
  toMessageTemplate,
  toMessageTemplateRenderResult,
  toMessageTemplateVariablesGroups,
} from "../model/message-template.utils";

const basePath = "/workplace/templates";

export const messageTemplatesApi = {
  list: async (type?: MessageTemplateType): Promise<MessageTemplate[]> => {
    const { data } = await apiClient.get<unknown>(basePath, {
      params: type ? { type } : undefined,
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map(toMessageTemplate)
      .filter((item): item is MessageTemplate => item !== null);
  },

  getVariables: async (): Promise<MessageTemplateVariablesGroup[]> => {
    const { data } = await apiClient.get<unknown>(`${basePath}/variables`);

    return toMessageTemplateVariablesGroups(data);
  },

  render: async (
    templateId: number,
    payload: MessageTemplateRenderPayload,
  ): Promise<MessageTemplateRenderResult | null> => {
    const { data } = await apiClient.post<unknown>(
      `${basePath}/${templateId}/render`,
      payload,
    );

    return toMessageTemplateRenderResult(data);
  },

  create: async (
    payload: MessageTemplateWritePayload,
  ): Promise<MessageTemplate | null> => {
    const { data } = await apiClient.post<unknown>(basePath, payload);

    return toMessageTemplate(data);
  },

  update: async (
    templateId: number,
    payload: MessageTemplateWritePayload,
  ): Promise<MessageTemplate | null> => {
    const { data } = await apiClient.patch<unknown>(
      `${basePath}/${templateId}`,
      payload,
    );

    return toMessageTemplate(data);
  },

  delete: async (templateId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${templateId}`);
  },
};
