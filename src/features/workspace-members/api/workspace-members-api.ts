import { apiClient } from "@/api/api-client";

import type {
  WorkspaceMember,
  WorkspaceMemberInvitePayload,
  WorkspaceMemberInviteResponse,
  WorkspaceMemberUpdatePayload,
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

function normalizeWorkspaceMembersList(data: unknown): WorkspaceMember[] {
  if (Array.isArray(data)) {
    return data.filter(isWorkspaceMember);
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    Array.isArray(data.items)
  ) {
    return data.items.filter(isWorkspaceMember);
  }

  return [];
}

export const workspaceMembersApi = {
  list: async (): Promise<WorkspaceMember[]> => {
    const { data } = await apiClient.get<unknown>(basePath);
    return normalizeWorkspaceMembersList(data);
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

  update: async (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ): Promise<WorkspaceMember | null> => {
    const { data } = await apiClient.put<unknown>(
      `${basePath}/${memberId}`,
      payload,
    );

    return isWorkspaceMember(data) ? data : null;
  },
};
