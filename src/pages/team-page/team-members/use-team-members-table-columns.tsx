import type { TableColumnsType } from "antd";
import { Flex, Select, Switch, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { RoleDot } from "@/shared/components/role-dot/role-dot";
import { fromNow } from "@/utils/date-time";

import { TeamMemberCell } from "./team-member-cell";

const { Text } = Typography;

type TeamMemberRoleOption = {
  value: number;
  label: string;
  color: string;
};

function getMemberStatus(status: string | null | undefined): {
  color: string;
  labelKey: string;
} {
  if (status === "active") {
    return { color: "success", labelKey: "team.table.statuses.active" };
  }

  if (status === "inactive") {
    return { color: "error", labelKey: "team.table.statuses.inactive" };
  }

  return { color: "default", labelKey: "team.table.statuses.unknown" };
}

const toRoleOptions = (roles: WorkspaceRole[]): TeamMemberRoleOption[] =>
  [...roles]
    .sort((a, b) => a.id - b.id)
    .map((role) => ({
      value: role.id,
      label: role.name,
      color: role.color ?? DEFAULT_COLOR_PRESET,
    }));

const getMemberRoleOptions = (
  member: WorkspaceMember,
  roleOptions: TeamMemberRoleOption[],
): TeamMemberRoleOption[] => {
  if (roleOptions.some((option) => option.value === member.roleId)) {
    return roleOptions;
  }

  return [
    {
      value: member.roleId,
      label: member.roleName || member.roleSlug || String(member.roleId),
      color: DEFAULT_COLOR_PRESET,
    },
    ...roleOptions,
  ];
};

const renderRoleOption = (option: TeamMemberRoleOption) => (
  <Flex align="center" gap={8}>
    <RoleDot color={option.color} />
    <Text>{option.label}</Text>
  </Flex>
);

type UseTeamMembersTableColumnsParams = {
  currentUserId: number | null;
  roles: WorkspaceRole[];
  rolesLoading: boolean;
  updatingMemberIds: readonly number[];
  onUpdateMember: (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ) => Promise<void>;
};

export function useTeamMembersTableColumns({
  currentUserId,
  roles,
  rolesLoading,
  updatingMemberIds,
  onUpdateMember,
}: UseTeamMembersTableColumnsParams): TableColumnsType<WorkspaceMember> {
  const { t } = useTranslation();

  return useMemo(() => {
    const updatingMemberIdSet = new Set(updatingMemberIds);
    const roleOptions = toRoleOptions(roles);

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
        render: (value: number, record) => {
          const isUpdating = updatingMemberIdSet.has(record.id);
          const options = getMemberRoleOptions(record, roleOptions);

          return (
            <Select
              value={value}
              options={options}
              loading={rolesLoading || isUpdating}
              disabled={rolesLoading || isUpdating}
              style={{ minWidth: 180, width: "100%" }}
              popupMatchSelectWidth={false}
              showSearch={{ optionFilterProp: "label" }}
              optionRender={(option) =>
                renderRoleOption(option.data as TeamMemberRoleOption)
              }
              labelRender={(props) => {
                const id = props.value as number;
                const option = options.find((item) => item.value === id);
                const label =
                  option?.label || record.roleName || record.roleSlug || "-";
                const color = option?.color ?? DEFAULT_COLOR_PRESET;

                return renderRoleOption({ value: id, label, color });
              }}
              onChange={(nextRoleId) => {
                if (nextRoleId === value) {
                  return;
                }

                void onUpdateMember(record.id, {
                  role_id: nextRoleId,
                  can_be_assigned_to_chat: Boolean(
                    record.can_be_assigned_to_chat,
                  ),
                });
              }}
            />
          );
        },
      },
      {
        title: t("team.table.canBeAssignedToChat"),
        dataIndex: "can_be_assigned_to_chat",
        key: "can_be_assigned_to_chat",
        width: 250,
        align: "center",
        render: (value: boolean | null | undefined, record) => {
          const checked = Boolean(value);
          const isUpdating = updatingMemberIdSet.has(record.id);

          return (
            <Switch
              checked={checked}
              loading={isUpdating}
              disabled={isUpdating}
              onChange={(nextChecked) => {
                if (nextChecked === checked) {
                  return;
                }

                void onUpdateMember(record.id, {
                  role_id: record.roleId,
                  can_be_assigned_to_chat: nextChecked,
                });
              }}
            />
          );
        },
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
        title: t("team.table.joinedAt"),
        dataIndex: "joinedAt",
        key: "joinedAt",
        width: 250,
        render: (value: string) => (value ? fromNow(value) : "-"),
      },
    ];
  }, [
    currentUserId,
    onUpdateMember,
    roles,
    rolesLoading,
    t,
    updatingMemberIds,
  ]);
}
