import { apiClient } from "@/api/api-client";

import type {
  ConversationGroup,
  ConversationGroupsListResponse,
  ConversationGroupWritePayload,
} from "@/features/conversation-groups/model/conversation-group.types";

const basePath = "/conversation-groups";

export const conversationGroupsApi = {
  list: async (): Promise<ConversationGroup[]> => {
    const { data } =
      await apiClient.get<ConversationGroupsListResponse>(basePath);

    return data.items.map((group) => ({
      ...group,
      counter: group.counter ?? 0,
    }));
  },

  create: async (payload: ConversationGroupWritePayload): Promise<void> => {
    await apiClient.post(basePath, payload);
  },

  update: async (
    id: number,
    payload: ConversationGroupWritePayload,
  ): Promise<void> => {
    await apiClient.patch(`${basePath}/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },
};
