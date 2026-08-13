import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";

export type WorkspaceMemberUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar_src?: string;
};

export type WorkspaceMember = {
  id: number;
  workspaceId: number;
  userId: number;
  roleId: number;
  roleSlug: string;
  roleName: string;
  status: string;
  work_status: MemberWorkStatus;
  joinedAt: string;
  updated_at?: string;
  user: WorkspaceMemberUser;
  color?: string;
};

export type WorkspaceMembersListResponse = {
  items: WorkspaceMember[];
};

export type WorkspaceMemberInvitePayload = {
  email: string;
  role_id: number;
  skipConfirmation?: boolean;
  first_name: string;
  last_name: string;
};

export type WorkspaceMemberUpdatePayload = {
  role_id: number;
};

export type WorkspaceMemberInviteResponse = {
  kind: string;
  member: WorkspaceMember;
  invitationId: number;
  invitationToken: string;
};

export type WorkspaceMemberRegisterInfo = {
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  workspaceName?: string;
  workspace_name?: string;
};

export type WorkspaceMemberRegisterPayload = {
  first_name: string;
  last_name: string;
  password: string;
};

export type WorkspaceMemberRegisterResponse = {
  registered: boolean;
  access_token: string;
  member: WorkspaceMember;
};
