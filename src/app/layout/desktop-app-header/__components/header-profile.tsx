import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import { useUserStore } from "@/features/auth/model/use-user-store";

import * as S from "../desktop-app-header.styled";

export const HeaderProfile = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userStore = useUserStore();

  const displayName = userStore.displayName ?? t("profile.user");
  const avatarSrc = userStore.user?.avatar_src ?? undefined;

  return (
    <S.ProfileButton
      type="text"
      data-qa="layout-desktop-profile-link"
      onClick={() => navigate(pagesMap.settingsUser)}
    >
      <S.ProfileAvatarSlot>
        <UserAvatar name={displayName} size={28} src={avatarSrc} />
      </S.ProfileAvatarSlot>

      <S.ProfileName>{displayName}</S.ProfileName>
    </S.ProfileButton>
  );
});
