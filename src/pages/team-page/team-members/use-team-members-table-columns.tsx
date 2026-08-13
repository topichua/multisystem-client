import type { TableColumnsType } from "antd";
import { Tag } from "@/components/tag/tag";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { MemberWorkStatusLabel } from "@/shared/components/member-work-status/member-work-status-label";
import { fromNow } from "@/utils/date-time";

import { TeamMemberActions } from "./team-member-actions";
import { TeamMemberCell } from "./team-member-cell";
import { TeamMemberRoleSelect } from "./team-member-role-select";
import { getMemberStatus } from "./team-member.utils";

type UseTeamMembersTableColumnsParams = {
  currentUserId: number | null;
  roles: WorkspaceRole[];
  rolesLoading: boolean;
  updatingMemberIds: readonly number[];
  actionLoadingMemberIds: readonly number[];
  onUpdateMember: (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ) => Promise<void>;
  onDeleteMember: (member: WorkspaceMember) => Promise<void>;
  onResendInvite: (member: WorkspaceMember) => Promise<void>;
};

export function useTeamMembersTableColumns({
  currentUserId,
  roles,
  rolesLoading,
  updatingMemberIds,
  actionLoadingMemberIds,
  onUpdateMember,
  onDeleteMember,
  onResendInvite,
}: UseTeamMembersTableColumnsParams): TableColumnsType<WorkspaceMember> {
  const { t } = useTranslation();

  return useMemo(() => {
    const updatingMemberIdSet = new Set(updatingMemberIds);
    const actionLoadingMemberIdSet = new Set(actionLoadingMemberIds);

    return [
      {
        title: t("team.table.member"),
        key: "member",
        render: (_, record) => (
          <TeamMemberCell
            member={record}
            currentUserId={currentUserId}
            youLabel={t("team.table.you")}
          />
        ),
      },
      {
        title: t("team.table.role"),
        dataIndex: "roleId",
        key: "roleId",
        width: 220,
        render: (_, record) => (
          <TeamMemberRoleSelect
            member={record}
            roles={roles}
            rolesLoading={rolesLoading}
            isUpdating={updatingMemberIdSet.has(record.id)}
            onUpdateMember={onUpdateMember}
          />
        ),
      },
      {
        title: t("team.table.status"),
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (value: string | null | undefined) => {
          const status = getMemberStatus(value);

          return <Tag color={status.color}>{t(status.labelKey)}</Tag>;
        },
      },
      {
        title: t("team.table.workStatus"),
        dataIndex: "work_status",
        key: "work_status",
        width: 160,
        render: (value: WorkspaceMember["work_status"] | null | undefined) => (
          <MemberWorkStatusLabel status={value} />
        ),
      },
      {
        title: t("team.table.joinedAt"),
        dataIndex: "joinedAt",
        key: "joinedAt",
        width: 150,
        render: (value: string) => (value ? fromNow(value) : "-"),
      },
      {
        title: t("team.table.actions"),
        key: "actions",
        width: 64,
        align: "center",
        render: (_, record) => {
          const isActionLoading = actionLoadingMemberIdSet.has(record.id);

          return (
            <TeamMemberActions
              member={record}
              loading={isActionLoading}
              onDeleteMember={onDeleteMember}
              onResendInvite={onResendInvite}
            />
          );
        },
      },
    ];
  }, [
    actionLoadingMemberIds,
    currentUserId,
    onDeleteMember,
    onResendInvite,
    onUpdateMember,
    roles,
    rolesLoading,
    t,
    updatingMemberIds,
  ]);
}
