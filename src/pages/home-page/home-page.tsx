import { Button, Drawer } from "antd";
import { ListIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { AppSider } from "@/app/layout/app-sider/app-sider";
import { UserProfile } from "@/app/layout/user-profile/user-profile";
import { Conversation } from "@/pages/conversation/conversation-list";

import * as S from "./home-page.styled";

export const HomePage = () => {
  const { t } = useTranslation();
  const [isConversationDrawerOpen, setIsConversationDrawerOpen] =
    useState(false);

  return (
    <S.PageLayout>
      <AppSider />
      <S.WorkspaceLayout>
        <Outlet />
      </S.WorkspaceLayout>
      <S.MobileDock>
        <Button
          type="text"
          aria-label={t("nav.openConversationsAria")}
          icon={<ListIcon size={24} />}
          onClick={() => setIsConversationDrawerOpen(true)}
          data-qa="layout-mobile-dock-chats"
        />
        <UserProfile menuPlacement="topRight" />
      </S.MobileDock>
      <ConversationDrawer
        open={isConversationDrawerOpen}
        onClose={() => setIsConversationDrawerOpen(false)}
      />
    </S.PageLayout>
  );
};

function ConversationDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer
      title={t("conversations.drawerTitle")}
      placement="top"
      open={open}
      size={"100vh"}
      onClose={onClose}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div data-qa="layout-mobile-conversations-drawer">
        <Conversation onSelect={onClose} />
      </div>
    </Drawer>
  );
}
