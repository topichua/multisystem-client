import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Empty, Space, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { TeamInviteModal } from "../team-invite-modal";
import { useTeamMembersPage } from "../use-team-members-page";
import { MobileTeamMemberCard } from "./mobile-team-member-card";
import * as S from "./mobile-team-members-page.styled";

const { Text } = Typography;

export const MobileTeamMembersPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const updatingMemberIdSet = new Set(store.updatingMemberIds);
  const actionLoadingMemberIdSet = new Set(store.memberActionLoadingIds);
  const members = store.visibleMembers;

  return (
    <>
      <S.Root>
        <S.Header>
          <S.TitleCluster>
            <S.BackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("team.mobile.backToTeamAria")}
              data-qa="team-mobile-members-back"
              onClick={() => navigate(pagesMap.team)}
            />
            <S.PageTitle level={3}>{t("team.mobile.membersTitle")}</S.PageTitle>
          </S.TitleCluster>
          <S.InviteButton
            type="primary"
            icon={<PlusIcon size={16} />}
            aria-label={t("team.mobile.inviteAria")}
            data-qa="team-mobile-members-invite"
            onClick={openInviteModal}
          >
            <S.InviteButtonLabel>{t("team.inviteCta")}</S.InviteButtonLabel>
          </S.InviteButton>
        </S.Header>

        <S.Summary>
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
        </S.Summary>

        {store.listError && (
          <Alert type="error" title={store.listError} showIcon />
        )}

        {store.listLoading && members.length === 0 ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : members.length === 0 ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("team.mobile.emptyMembers")}
            />
          </S.StateContainer>
        ) : (
          <S.MemberList>
            {members.map((member) => (
              <MobileTeamMemberCard
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                roles={rolesStore.roles}
                rolesLoading={rolesStore.listLoading}
                isUpdating={updatingMemberIdSet.has(member.id)}
                isActionLoading={actionLoadingMemberIdSet.has(member.id)}
                onUpdateMember={handleMemberUpdate}
                onDeleteMember={handleDeleteMember}
                onResendInvite={handleResendInvite}
              />
            ))}
          </S.MemberList>
        )}
      </S.Root>

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
