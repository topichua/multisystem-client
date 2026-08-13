import { Tag } from "@/components/tag/tag";
import { useTranslation } from "react-i18next";

import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { MemberWorkStatusLabel } from "@/shared/components/member-work-status/member-work-status-label";
import { fromNow } from "@/utils/date-time";

import { TeamMemberActions } from "../team-member-actions";
import { TeamMemberCell } from "../team-member-cell";
import { TeamMemberRoleSelect } from "../team-member-role-select";
import { getMemberStatus } from "../team-member.utils";
import * as S from "./mobile-team-members-page.styled";

type MobileTeamMemberCardProps = {
  member: WorkspaceMember;
  currentUserId: number | null;
  roles: WorkspaceRole[];
  rolesLoading: boolean;
  isUpdating: boolean;
  isActionLoading: boolean;
  onUpdateMember: (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ) => Promise<void>;
  onDeleteMember: (member: WorkspaceMember) => Promise<void>;
  onResendInvite: (member: WorkspaceMember) => Promise<void>;
};

export function MobileTeamMemberCard({
  member,
  currentUserId,
  roles,
  rolesLoading,
  isUpdating,
  isActionLoading,
  onUpdateMember,
  onDeleteMember,
  onResendInvite,
}: MobileTeamMemberCardProps) {
  const { t } = useTranslation();
  const status = getMemberStatus(member.status);
  const joinedLabel = member.joinedAt ? fromNow(member.joinedAt) : null;

  return (
    <S.MemberCard data-qa={`team-mobile-member-card-${member.id}`}>
      <S.CardHeader>
        <S.MemberIdentityWrap>
          <TeamMemberCell
            member={member}
            currentUserId={currentUserId}
            youLabel={t("team.table.you")}
          />
        </S.MemberIdentityWrap>
        <TeamMemberActions
          member={member}
          loading={isActionLoading}
          actionsDataQa={`team-mobile-member-actions-${member.id}`}
          onDeleteMember={onDeleteMember}
          onResendInvite={onResendInvite}
        />
      </S.CardHeader>

      <S.FieldGroup>
        <S.FieldLabel>{t("team.table.role")}</S.FieldLabel>
        <TeamMemberRoleSelect
          member={member}
          roles={roles}
          rolesLoading={rolesLoading}
          isUpdating={isUpdating}
          onUpdateMember={onUpdateMember}
          dataQa={`team-mobile-member-role-${member.id}`}
        />
      </S.FieldGroup>

      <S.FieldGroup>
        <S.FieldLabel>{t("team.table.workStatus")}</S.FieldLabel>
        <MemberWorkStatusLabel status={member.work_status} />
      </S.FieldGroup>

      <S.CardFooter align="center" gap={8} wrap="wrap">
        <Tag color={status.color}>{t(status.labelKey)}</Tag>
        {joinedLabel && (
          <>
            <S.FooterSeparator aria-hidden="true">·</S.FooterSeparator>
            <S.JoinedText>{joinedLabel}</S.JoinedText>
          </>
        )}
      </S.CardFooter>
    </S.MemberCard>
  );
}
