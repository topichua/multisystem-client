import type { MenuProps } from "antd";
import { Menu, Popover } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useAuth } from "@/features/auth/model/use-auth";
import { useUserStore } from "@/features/auth/model/use-user-store";

import * as S from "./user-profile.styled";

type UserProfileProps = {
  menuPlacement?: "rightTop" | "topRight";
  collapsed?: boolean;
};

export const UserProfile = observer(
  ({ menuPlacement = "rightTop", collapsed = true }: UserProfileProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const userStore = useUserStore();
    const displayName = userStore.displayName ?? t("profile.user");
    const avatarSrc = userStore.user?.avatar_src ?? undefined;

    const items: MenuProps["items"] = useMemo(
      () => [
        {
          key: "profile_changes",
          label: t("profile.changeSettings"),
          onClick: () => navigate(pagesMap.settingsUser),
        },
        {
          key: "log-out",
          label: t("profile.logOut"),
          onClick: logout,
        },
      ],
      [logout, navigate, t],
    );

    return (
      <Popover
        placement={menuPlacement}
        trigger={["click", "hover"]}
        arrow={false}
        destroyOnHidden
        styles={{ container: { padding: 4 } }}
        content={
          <Menu
            selectable={false}
            style={{ border: "none", boxShadow: "none", minWidth: 200 }}
            items={items}
          />
        }
      >
        <S.ProfileTrigger>
          <S.ProfileAvatarSlot>
            <S.Avatar
              data-qa="layout-app-user-menu-trigger"
              name={displayName}
              size={32}
              src={avatarSrc}
            />
          </S.ProfileAvatarSlot>
          <S.ProfileText $collapsed={collapsed}>
            <S.ProfileName>{displayName}</S.ProfileName>
            <S.ProfileSubtitle>{t("profile.myProfile")}</S.ProfileSubtitle>
          </S.ProfileText>
        </S.ProfileTrigger>
      </Popover>
    );
  },
);
