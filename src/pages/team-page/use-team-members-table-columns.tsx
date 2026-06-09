import type { TableColumnsType } from "antd";
import { Tag } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

import { TeamMemberCell } from "./team-member-cell";

function memberStatusToColor(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes("active") || normalized.includes("joined")) {
    return "success";
  }

  if (normalized.includes("pending") || normalized.includes("invit")) {
    return "processing";
  }

  if (normalized.includes("inactive") || normalized.includes("disabled")) {
    return "default";
  }

  return "default";
}

type UseTeamMembersTableColumnsParams = {
  currentUserId: number | null;
};

export function useTeamMembersTableColumns({
  currentUserId,
}: UseTeamMembersTableColumnsParams): TableColumnsType<WorkspaceMember> {
  const { t } = useTranslation();

  return useMemo(
    () => [
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
        dataIndex: "roleName",
        key: "roleName",
        width: 160,
        ellipsis: true,
        render: (value: string, record) => value || record.roleSlug || "—",
      },
      {
        title: t("team.table.status"),
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (value: string) => (
          <Tag color={memberStatusToColor(value)}>{value || "—"}</Tag>
        ),
      },
      {
        title: t("team.table.joinedAt"),
        dataIndex: "joinedAt",
        key: "joinedAt",
        width: 150,
        render: (value: string) =>
          value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—",
      },
    ],
    [currentUserId, t],
  );
}
