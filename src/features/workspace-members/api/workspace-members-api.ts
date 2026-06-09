import { apiClient } from "@/api/api-client";

import type {
  WorkspaceMember,
  WorkspaceMemberInvitePayload,
  WorkspaceMemberInviteResponse,
  WorkspaceMembersListResponse,
} from "../model/workspace-member.types";

const basePath = "/workspaces/members";

function isWorkspaceMember(value: unknown): value is WorkspaceMember {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "user" in value &&
    typeof value.id === "number"
  );
}

export const workspaceMembersApi = {
  list: async (): Promise<WorkspaceMember[]> => {
    const { data } =
      await apiClient.get<WorkspaceMembersListResponse>(basePath);
    return Array.isArray(data?.items) ? data.items : [];
  },

  invite: async (
    payload: WorkspaceMemberInvitePayload,
  ): Promise<WorkspaceMemberInviteResponse | null> => {
    const { data } = await apiClient.post<unknown>(
      `${basePath}/invite`,
      payload,
    );

    if (
      typeof data === "object" &&
      data !== null &&
      "member" in data &&
      isWorkspaceMember(data.member)
    ) {
      return data as WorkspaceMemberInviteResponse;
    }

    return null;
  },
};
