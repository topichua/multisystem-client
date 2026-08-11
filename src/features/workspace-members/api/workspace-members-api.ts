import { apiClient } from "@/api/api-client";
import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";

import type {
  WorkspaceMember,
  WorkspaceMemberInvitePayload,
  WorkspaceMemberInviteResponse,
  WorkspaceMemberRegisterInfo,
  WorkspaceMemberRegisterPayload,
  WorkspaceMemberRegisterResponse,
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

  updateMyWorkStatus: async (
    workStatus: MemberWorkStatus,
  ): Promise<MemberWorkStatus> => {
    const { data } = await apiClient.patch<{
      work_status?: MemberWorkStatus;
    }>(`${basePath}/me/work-status`, {
      work_status: workStatus,
    });

    return data.work_status ?? workStatus;
  },

  removeInvite: async (memberId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${memberId}/remove-invite`);
  },

  deactivate: async (memberId: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${memberId}/deactivate`);
  },

  resend: async (memberId: number): Promise<void> => {
    await apiClient.post(`${basePath}/${memberId}/resend`);
  },

  getRegisterInfo: async (
    hash: string,
  ): Promise<WorkspaceMemberRegisterInfo> => {
    const { data } = await apiClient.get<WorkspaceMemberRegisterInfo>(
      `${basePath}/register`,
      { params: { hash } },
    );

    return data;
  },

  register: async (
    hash: string,
    payload: WorkspaceMemberRegisterPayload,
  ): Promise<WorkspaceMemberRegisterResponse> => {
    const { data } = await apiClient.post<WorkspaceMemberRegisterResponse>(
      `${basePath}/register`,
      payload,
      { params: { hash } },
    );

    return data;
  },
};
