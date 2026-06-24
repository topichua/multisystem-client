import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

export const getWorkspaceMemberName = (member: WorkspaceMember): string => {
  const name =
    `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim();
  return name || member.user.email;
};
