import { apiClient } from "@/api/api-client";

import type {
  ConversationGroup,
  ConversationGroupResponse,
  ConversationGroupsListResponse,
  ConversationGroupsListResult,
  ConversationGroupWritePayload,
} from "@/features/conversation-groups/model/conversation-group.types";

const basePath = "/conversation-groups";

type ConversationGroupsListParams = {
  includeDistribution?: boolean;
};

const buildListQuery = (
  params?: ConversationGroupsListParams,
): Record<string, string> | undefined =>
  params?.includeDistribution ? { include_distribution: "true" } : undefined;

const normalizeConversationGroup = ({
  counter,
  conversationCount,
  createdById,
  description,
  color,
  ...group
}: ConversationGroupResponse): ConversationGroup => ({
  ...group,
  color: color ?? "",
  description: description ?? "",
  createdById: createdById ?? null,
  counter: conversationCount ?? counter ?? 0,
});

export const conversationGroupsApi = {
  list: async (
    params?: ConversationGroupsListParams,
  ): Promise<ConversationGroupsListResult> => {
    const { data } = await apiClient.get<ConversationGroupsListResponse>(
      basePath,
      {
        params: buildListQuery(params),
      },
    );

    const groups = data.items.map(normalizeConversationGroup);
    const fallbackTotalConversations = groups.reduce(
      (total, group) => total + group.counter,
      0,
    );

    return {
      groups,
      totalConversations: data.totalConversations ?? fallbackTotalConversations,
    };
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
