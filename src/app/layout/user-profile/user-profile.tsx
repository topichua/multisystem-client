import { UserIcon } from "@phosphor-icons/react";
import type { MenuProps } from "antd";
import { Menu, Popover } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/model/use-auth";

import * as S from "./user-profile.styled";

type UserProfileProps = {
  menuPlacement?: "rightTop" | "topRight";
};

export const UserProfile = ({
  menuPlacement = "rightTop",
}: UserProfileProps) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        key: "log-out",
        label: t("profile.logOut"),
        onClick: logout,
      },
    ],
    [logout, t],
  );

  return (
    <Popover
      placement={menuPlacement}
      trigger={["click"]}
      destroyOnHidden
      content={
        <Menu
          selectable={false}
          style={{ border: "none", boxShadow: "none", minWidth: 200 }}
          items={items}
        />
      }
    >
      <S.Avatar icon={<UserIcon />} />
    </Popover>
  );
};
