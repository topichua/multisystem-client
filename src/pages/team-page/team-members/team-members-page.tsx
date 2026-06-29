import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Space, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

import { TeamInviteModal } from "./team-invite-modal";
import * as S from "./team-members-page.styled";
import { useTeamMembersPage } from "./use-team-members-page";
import { useTeamMembersTableColumns } from "./use-team-members-table-columns";

const { Text } = Typography;

export const TeamMembersPage = observer(() => {
  const { t } = useTranslation();
  const {
    store,
    rolesStore,
    form,
    inviteModalOpen,
    currentUserId,
    openInviteModal,
    closeInviteModal,
    handleInviteSubmit,
    handleMemberUpdate,
    handleDeleteMember,
    handleResendInvite,
  } = useTeamMembersPage();

  const columns = useTeamMembersTableColumns({
    currentUserId,
    roles: rolesStore.roles,
    rolesLoading: rolesStore.listLoading,
    updatingMemberIds: store.updatingMemberIds,
    actionLoadingMemberIds: store.memberActionLoadingIds,
    onUpdateMember: handleMemberUpdate,
    onDeleteMember: handleDeleteMember,
    onResendInvite: handleResendInvite,
  });

  if (store.listLoading && store.members.length === 0) {
    return <CenteredSpinner />;
  }

  return (
    <>
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
              dataSource={store.visibleMembers}
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
