import { PlusIcon } from "@phosphor-icons/react";
import {
  Button,
  Flex,
  Form,
  message,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { useUserStore } from "@/features/auth/model/use-user-store";
import type {
  WorkspaceMember,
  WorkspaceMemberUpdatePayload,
} from "@/features/workspace-members/model/workspace-member.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";

import {
  TeamInviteModal,
  type TeamInviteFormValues,
} from "./team-invite-modal";
import * as S from "./team-members-page.styled";
import { useTeamMembersTableColumns } from "./use-team-members-table-columns";

const { Text } = Typography;

export const TeamMembersPage = observer(() => {
  const { t } = useTranslation();
  const store = useWorkspaceMembersStore();
  const rolesStore = useWorkspaceRolesStore();
  const userStore = useUserStore();
  const [messageApi, contextHolder] = message.useMessage();
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
        messageApi.error(getApiErrorMessage(e, t("team.memberUpdateError")));
        throw e;
      }
    },
    [messageApi, store, t],
  );

  const handleDeleteMember = useCallback(
    async (member: WorkspaceMember): Promise<void> => {
      try {
        if (member.status === "inactive") {
          await store.removeInvite(member.id);
          messageApi.success(t("team.actions.removeInviteSuccess"));
          return;
        }

        await store.deactivateMember(member.id);
        messageApi.success(t("team.actions.deactivateSuccess"));
      } catch (e) {
        messageApi.error(getApiErrorMessage(e, t("team.actions.deleteError")));
      }
    },
    [messageApi, store, t],
  );

  const handleResendInvite = useCallback(
    async (member: WorkspaceMember): Promise<void> => {
      try {
        await store.resendInvite(member.id);
        messageApi.success(t("team.actions.resendInviteSuccess"));
      } catch (e) {
        messageApi.error(
          getApiErrorMessage(e, t("team.actions.resendInviteError")),
        );
      }
    },
    [messageApi, store, t],
  );

  const columns = useTeamMembersTableColumns({
    currentUserId: userStore.user?.id ?? null,
    roles: rolesStore.roles,
    rolesLoading: rolesStore.listLoading,
    updatingMemberIds: store.updatingMemberIds,
    actionLoadingMemberIds: store.memberActionLoadingIds,
    onUpdateMember: handleMemberUpdate,
    onDeleteMember: handleDeleteMember,
    onResendInvite: handleResendInvite,
  });

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
      messageApi.success(t("team.invite.success"));
      closeInviteModal();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("team.invite.error")));
    }
  }, [closeInviteModal, form, messageApi, store, t]);

  if (store.listLoading && store.members.length === 0) {
    return (
      <>
        {contextHolder}
        <Spin style={{ marginTop: 24 }} />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header data-qa="layout-team-members-header">
          <Flex justify="space-between" align="center" gap={16} wrap="wrap">
            <Flex gap={4} vertical>
              <PaneSectionTitle>{t("team.membersTitle")}</PaneSectionTitle>
              <Space align="center" size="small" separator="·">
                <Text type="secondary">
                  {t("team.membersActiveCount", {
                    count: store.activeMembersCount,
                  })}
                </Text>
                <Text type="secondary">
                  {t("team.membersInactiveCount", {
                    count: store.inactiveMembersCount,
                  })}
                </Text>
              </Space>
            </Flex>
            <Button
              type="primary"
              icon={<PlusIcon size={16} />}
              onClick={openInviteModal}
            >
              {t("team.inviteCta")}
            </Button>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-team-members-table-scroll">
          <S.TableSection>
            {store.listError && (
              <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
                {store.listError}
              </Text>
            )}
            <Table<WorkspaceMember>
              rowKey="id"
              columns={columns}
              dataSource={store.members}
              pagination={false}
              loading={store.listLoading}
            />
          </S.TableSection>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <TeamInviteModal
        open={inviteModalOpen}
        form={form}
        inviteLoading={store.inviteLoading}
        roles={rolesStore.roles}
        rolesLoading={rolesStore.listLoading}
        onCancel={closeInviteModal}
        onSubmit={handleInviteSubmit}
      />
    </>
  );
});
