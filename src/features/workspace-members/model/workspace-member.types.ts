export type WorkspaceMemberUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

export type WorkspaceMember = {
  id: number;
  workspaceId: number;
  userId: number;
  roleId: number;
  roleSlug: string;
  roleName: string;
  can_be_assigned_to_chat: boolean;
  status: string;
  joinedAt: string;
  user: WorkspaceMemberUser;
};

export type WorkspaceMembersListResponse = {
  items: WorkspaceMember[];
};

export type WorkspaceMemberInvitePayload = {
  email: string;
  role_id: number;
  skipConfirmation?: boolean;
  first_name?: string;
  last_name?: string;
};

export type WorkspaceMemberUpdatePayload = {
  role_id: number;
  can_be_assigned_to_chat: boolean;
};

export type WorkspaceMemberInviteResponse = {
  kind: string;
  member: WorkspaceMember;
  invitationId: number;
  invitationToken: string;
};
