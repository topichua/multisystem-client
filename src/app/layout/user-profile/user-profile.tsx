import { UserIcon } from "@phosphor-icons/react";
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

function getInitials(value: string | null): string | undefined {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }

  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
      : source.slice(0, 2);

  return letters.toUpperCase();
}

export const UserProfile = observer(
  ({ menuPlacement = "rightTop", collapsed = true }: UserProfileProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const userStore = useUserStore();
    const displayName = userStore.displayName ?? t("profile.user");
    const initials = getInitials(displayName);

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
            <S.Avatar size={32} icon={initials ? undefined : <UserIcon />}>
              {initials}
            </S.Avatar>
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
