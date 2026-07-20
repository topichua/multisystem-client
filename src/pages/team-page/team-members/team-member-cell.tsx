import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { UserAvatar } from "@/components/user-avatar";
import * as S from "./team-members-page.styled";

function formatMemberName(member: WorkspaceMember): string {
  const parts = [member.user.firstName, member.user.lastName].filter(Boolean);
  return parts.join(" ").trim() || "—";
}

function getMemberInitials(member: WorkspaceMember): string {
  const first = member.user.firstName?.trim();
  const last = member.user.lastName?.trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) {
    return first.slice(0, 2).toUpperCase();
  }

  const email = member.user.email?.trim();
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "?";
}

type TeamMemberCellProps = {
  member: WorkspaceMember;
  currentUserId: number | null;
  youLabel: string;
};

export const TeamMemberCell = ({
  member,
  currentUserId,
  youLabel,
}: TeamMemberCellProps) => {
  const isCurrentUser =
    currentUserId !== null && member.userId === currentUserId;
  const name = formatMemberName(member);
  const email = member.user.email?.trim() || "—";

  return (
    <S.MemberIdentity>
      <UserAvatar
        size={40}
        name={getMemberInitials(member)}
        src={member.user.avatar_src || undefined}
        style={
          member.color
            ? {
                backgroundColor: member.color,
              }
            : undefined
        }
      />
      <S.MemberText>
        <S.MemberNameRow>
          <S.MemberName>{name}</S.MemberName>
          {isCurrentUser && <S.YouTag>{youLabel}</S.YouTag>}
        </S.MemberNameRow>
        <S.MemberEmail>{email}</S.MemberEmail>
      </S.MemberText>
    </S.MemberIdentity>
  );
};
