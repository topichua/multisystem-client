import { SignOutIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/model/use-auth";

import * as S from "../desktop-app-header.styled";

export const HeaderLogout = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <S.IconButton
      type="text"
      aria-label={t("profile.logOut")}
      data-qa="layout-desktop-logout"
      icon={<SignOutIcon size={18} />}
      onClick={logout}
    />
  );
};
