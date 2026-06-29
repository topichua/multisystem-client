import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import type { WorkspaceRole } from "@/features/workspace-roles/model/workspace-role.types";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";

export type TeamMemberRoleOption = {
  value: number;
  label: string;
  color: string;
};

export function getMemberStatus(status: string | null | undefined): {
  color: string;
  labelKey: string;
} {
  if (status === "active") {
    return { color: "success", labelKey: "team.table.statuses.active" };
  }

  if (status === "inactive") {
    return { color: "error", labelKey: "team.table.statuses.inactive" };
  }

  if (status === "deactivated") {
    return { color: "default", labelKey: "team.table.statuses.deactivated" };
  }

  return { color: "default", labelKey: "team.table.statuses.unknown" };
}

export const toRoleOptions = (roles: WorkspaceRole[]): TeamMemberRoleOption[] =>
  [...roles]
    .sort((a, b) => a.id - b.id)
    .map((role) => ({
      value: role.id,
      label: role.name,
      color: role.color ?? DEFAULT_COLOR_PRESET,
    }));

export const getMemberRoleOptions = (
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
