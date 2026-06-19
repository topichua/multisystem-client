import {
  DotsThreeIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Popconfirm, theme } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

type TeamMemberActionsProps = {
  member: WorkspaceMember;
  loading: boolean;
  onDeleteMember: (member: WorkspaceMember) => Promise<void>;
  onResendInvite: (member: WorkspaceMember) => Promise<void>;
};

export function TeamMemberActions({
  member,
  loading,
  onDeleteMember,
  onResendInvite,
}: TeamMemberActionsProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const canResend = member.status === "inactive";
  const canDelete = member.status === "inactive" || member.status === "active";
  const hasActions = canResend || canDelete;

  const handleResendInvite = async () => {
    await onResendInvite(member);
    setOpen(false);
  };

  const handleDeleteMember = async () => {
    await onDeleteMember(member);
    setOpen(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        menu={{ items: [] }}
        placement="bottomRight"
        popupRender={() => (
          <Flex
            vertical
            gap={4}
            style={{
              padding: 4,
              borderRadius: token.borderRadius,
              background: token.colorBgElevated,
              boxShadow: token.boxShadowSecondary,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {canResend && (
              <Button
                type="text"
                block
                disabled={loading}
                icon={<PaperPlaneTiltIcon size={16} />}
                style={{ justifyContent: "flex-start" }}
                onClick={() => void handleResendInvite()}
              >
                {t("team.actions.resendInvite")}
              </Button>
            )}

            {canDelete && (
              <Popconfirm
                title={t(
                  member.status === "inactive"
                    ? "team.actions.removeInviteConfirm"
                    : "team.actions.deactivateConfirm",
                )}
                okText={t("team.actions.delete")}
                okButtonProps={{ danger: true }}
                onConfirm={() => void handleDeleteMember()}
              >
                <Button
                  danger
                  type="text"
                  block
                  disabled={loading}
                  icon={<TrashIcon size={16} />}
                  style={{ justifyContent: "flex-start" }}
                >
                  {t("team.actions.delete")}
                </Button>
              </Popconfirm>
            )}
          </Flex>
        )}
      >
        <Button
          type="text"
          size="small"
          loading={loading}
          disabled={!hasActions}
          icon={<DotsThreeIcon size={24} />}
          aria-label={t("team.table.actions")}
          aria-expanded={open}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
}
