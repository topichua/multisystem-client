import type { ConversationAssignee } from "@/features/conversations/model/types";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

export const getWorkspaceMemberAssignee = (
  member: WorkspaceMember,
): ConversationAssignee => ({
  id: member.id,
  name: getWorkspaceMemberName(member),
  profilePic: member.user.avatar_src ?? null,
  avatarColor: member.color,
});
