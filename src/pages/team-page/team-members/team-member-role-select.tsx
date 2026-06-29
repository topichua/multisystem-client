import { Flex, Select, Typography } from "antd";
import { useMemo } from "react";

import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { RoleDot } from "@/shared/components/role-dot/role-dot";

import {
  getMemberRoleOptions,
  toRoleOptions,
  type TeamMemberRoleOption,
} from "./team-member.utils";

const { Text } = Typography;

const renderRoleOption = (option: TeamMemberRoleOption) => (
  <Flex align="center" gap={8}>
    <RoleDot color={option.color} />
    <Text>{option.label}</Text>
  </Flex>
);

type TeamMemberRoleSelectProps = {
  member: WorkspaceMember;
  roles: WorkspaceRole[];
  rolesLoading: boolean;
  isUpdating: boolean;
  onUpdateMember: (
    memberId: number,
    payload: WorkspaceMemberUpdatePayload,
  ) => Promise<void>;
  dataQa?: string;
};

export function TeamMemberRoleSelect({
  member,
  roles,
  rolesLoading,
  isUpdating,
  onUpdateMember,
  dataQa,
}: TeamMemberRoleSelectProps) {
  const roleOptions = useMemo(() => toRoleOptions(roles), [roles]);
  const options = useMemo(
    () => getMemberRoleOptions(member, roleOptions),
    [member, roleOptions],
  );

  return (
    <Select
      value={member.roleId}
      options={options}
      loading={rolesLoading || isUpdating}
      disabled={rolesLoading || isUpdating}
      style={{ width: "100%" }}
      popupMatchSelectWidth={false}
      showSearch={{ optionFilterProp: "label" }}
      optionRender={(option) =>
        renderRoleOption(option.data as TeamMemberRoleOption)
      }
      labelRender={(props) => {
        const id = props.value as number;
        const option = options.find((item) => item.value === id);
        const label =
          option?.label || member.roleName || member.roleSlug || "-";
        const color = option?.color ?? DEFAULT_COLOR_PRESET;

        return renderRoleOption({ value: id, label, color });
      }}
      onChange={(nextRoleId) => {
        if (nextRoleId === member.roleId) {
          return;
        }

        void onUpdateMember(member.id, {
          role_id: nextRoleId,
          can_be_assigned_to_chat: Boolean(member.can_be_assigned_to_chat),
        });
      }}
      {...(dataQa ? { "data-qa": dataQa } : {})}
    />
  );
}
