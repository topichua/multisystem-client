import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useUserStore } from "@/features/auth/model/use-user-store";
import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TeamInviteFormValues } from "./team-invite-modal";

export function useTeamMembersPage() {
  const { t } = useTranslation();
  const store = useWorkspaceMembersStore();
  const rolesStore = useWorkspaceRolesStore();
  const userStore = useUserStore();
  const notification = useNotification();
  const [form] = Form.useForm<TeamInviteFormValues>();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const inviteDefaultRoleId = useMemo(
    () => [...rolesStore.roles].sort((a, b) => a.id - b.id)[0]?.id,
    [rolesStore.roles],
  );

  useEffect(() => {
    void store.loadMembers();
  }, [store]);

  useEffect(() => {
    if (rolesStore.roles.length === 0) {
      void rolesStore.loadRoles();
    }
  }, [rolesStore, rolesStore.roles.length]);

  const handleMemberUpdate = useCallback(
    async (
      memberId: number,
      payload: WorkspaceMemberUpdatePayload,
    ): Promise<void> => {
      try {
        await store.updateMember(memberId, payload);
      } catch (e) {
        notification.error({
          message: getApiErrorMessage(e, t("team.memberUpdateError")),
        });
        throw e;
      }
    },
    [notification, store, t],
  );

  const handleDeleteMember = useCallback(
    async (member: WorkspaceMember): Promise<void> => {
      try {
        if (member.status === "inactive") {
          await store.removeInvite(member.id);
          notification.success({
            message: t("team.actions.removeInviteSuccess"),
          });
          return;
        }

        await store.deactivateMember(member.id);
        notification.success({
          message: t("team.actions.deactivateSuccess"),
        });
      } catch (e) {
        notification.error({
          message: getApiErrorMessage(e, t("team.actions.deleteError")),
        });
      }
    },
    [notification, store, t],
  );

  const handleResendInvite = useCallback(
    async (member: WorkspaceMember): Promise<void> => {
      try {
        await store.resendInvite(member.id);
        notification.success({
          message: t("team.actions.resendInviteSuccess"),
        });
      } catch (e) {
        notification.error({
          message: getApiErrorMessage(e, t("team.actions.resendInviteError")),
        });
      }
    },
    [notification, store, t],
  );

  const openInviteModal = useCallback(() => {
    form.setFieldsValue({
      firstName: "",
      lastName: "",
      email: "",
      roleId: inviteDefaultRoleId,
    });
    setInviteModalOpen(true);
  }, [form, inviteDefaultRoleId]);

  const closeInviteModal = useCallback(() => {
    setInviteModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleInviteSubmit = useCallback(async () => {
    let values: TeamInviteFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      await store.inviteMember({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        role_id: values.roleId,
        skipConfirmation: false,
      });
      notification.success({
        message: t("team.invite.success"),
      });
      closeInviteModal();
    } catch (e) {
      notification.error({
        message: getApiErrorMessage(e, t("team.invite.error")),
      });
    }
  }, [closeInviteModal, form, notification, store, t]);

  return {
    store,
    rolesStore,
    form,
    inviteModalOpen,
    currentUserId: userStore.user?.id ?? null,
    openInviteModal,
    closeInviteModal,
    handleInviteSubmit,
    handleMemberUpdate,
    handleDeleteMember,
    handleResendInvite,
  };
}
