import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, message, Spin, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { useUserStore } from '@/features/auth/model/use-user-store';
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";

import {
  TeamInviteModal,
  type TeamInviteFormValues,
} from "./team-invite-modal";
import * as S from './team-members-page.styled';
import { useTeamMembersTableColumns } from "./use-team-members-table-columns";

const { Text } = Typography;

export const TeamMembersPage = observer(() => {
  const { t } = useTranslation();
  const store = useWorkspaceMembersStore();
  const userStore = useUserStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<TeamInviteFormValues>();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const columns = useTeamMembersTableColumns({
    currentUserId: userStore.user?.id ?? null,
  });

  useEffect(() => {
    void store.loadMembers();
  }, [store]);

  const openInviteModal = useCallback(() => {
    form.setFieldsValue({ email: "", roleSlug: "manager" });
    setInviteModalOpen(true);
  }, [form]);

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
        email: values.email.trim(),
        role_id: store.resolveRoleId(values.roleSlug),
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
            <PaneSectionTitle>{t('team.membersTitle')}</PaneSectionTitle>
            <Button
              type="primary"
              icon={<PlusIcon size={16} />}
              onClick={openInviteModal}
            >
              {t('team.inviteCta')}
            </Button>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-team-members-table-scroll">
          <S.TableSection>
            {store.listError && (
              <Text type="danger" style={{ display: 'block', marginBottom: 8 }}>
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
        onCancel={closeInviteModal}
        onSubmit={handleInviteSubmit}
      />
    </>
  );
});
