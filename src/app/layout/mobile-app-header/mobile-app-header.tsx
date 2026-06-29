import { ListIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { UserProfile } from "@/app/layout/user-profile/user-profile";
import { pagesMap } from "@/app/router/pages-map";
import type { MobileNavItem } from "@/app/router/navigation";
import { useIsMobileViewport } from "@/utils/use-media-query";

import * as S from "./mobile-app-header.styled";
import { MobileAppNavigationDrawer } from "./mobile-app-navigation-drawer";

export const MobileAppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobileViewport();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  if (!isMobile) {
    return null;
  }

  const handleNavigate = (item: MobileNavItem) => {
    navigate(item.path);
    setIsNavigationOpen(false);
  };

  return (
    <>
      <S.Header>
        <S.ControlSlot $align="left">
          <S.IconButton
            type="text"
            aria-label={t("nav.openMobileNavigationAria")}
            icon={<ListIcon size={24} />}
            data-qa="layout-mobile-navigation-open"
            onClick={() => setIsNavigationOpen(true)}
          />
        </S.ControlSlot>

        <S.BrandButton
          type="button"
          aria-label={t("nav.returnWorkspaceHomeAria")}
          onClick={() => navigate(pagesMap.home)}
        >
          <S.BrandLogo src="/logos/logo.png" alt="" aria-hidden="true" />
          <S.BrandText>{t("brand")}</S.BrandText>
        </S.BrandButton>

        <S.ControlSlot $align="right">
          <UserProfile menuPlacement="bottomRight" touchTarget />
        </S.ControlSlot>
      </S.Header>

      <MobileAppNavigationDrawer
        open={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
};
