import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { mainNavItems, isNavItemActive } from "@/app/router/navigation";
import { pagesMap } from "@/app/router/pages-map";

import { UserProfile } from "../user-profile/user-profile";
import * as S from "./app-sider.styled";

const { Text } = Typography;

type MenuSiderMainProps = {
  showLabel: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
};

const MenuSiderMain = observer(
  ({ showLabel, onOpenDrawer, onCloseDrawer }: MenuSiderMainProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    return (
      <S.MenuSider $showLabel={showLabel}>
        {mainNavItems.map((item) => {
          const isActive = isNavItemActive(item, location.pathname);
          const qaKey =
            item.path.replace(/\//g, "_").replace(/^_/, "") || "root";

          return (
            <S.Button
              key={item.path}
              icon={item.icon}
              className={isActive ? "active" : ""}
              onClick={() => {
                navigate(item.path);
                onCloseDrawer();
              }}
              onMouseEnter={onOpenDrawer}
              block
              style={
                showLabel
                  ? { display: "flex", justifyContent: "flex-start" }
                  : undefined
              }
              data-qa={
                showLabel
                  ? `fullWidth_menu_sider_${qaKey}`
                  : `menu_sider_${qaKey}`
              }
              $showLabel={showLabel}
            >
              {showLabel ? (
                <Text className="common-button-text">{t(item.labelKey)}</Text>
              ) : undefined}
            </S.Button>
          );
        })}
      </S.MenuSider>
    );
  },
);

export const AppSider = observer(() => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const goHome = () => {
    navigate(pagesMap.home);
    setIsDrawerOpen(false);
  };

  return (
    <S.Wrapper>
      <S.MenuSiderPanel
        $isDrawerOpen={isDrawerOpen}
        onMouseEnter={() => setIsDrawerOpen(true)}
        onMouseLeave={() => setIsDrawerOpen(false)}
      >
        <S.SiderScrollArea>
          <S.Brand
            $showLabel={isDrawerOpen}
            role="button"
            tabIndex={0}
            aria-label={t('nav.homeAria')}
            onClick={goHome}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goHome();
              }
            }}
          >
            <S.BrandLogo src="/logos/logo.png" alt={`${t('brand')} icon`} />
            {isDrawerOpen && <S.BrandLogoText>{t('brand')}</S.BrandLogoText>}
          </S.Brand>
          <MenuSiderMain
            showLabel={isDrawerOpen}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onCloseDrawer={() => setIsDrawerOpen(false)}
          />
        </S.SiderScrollArea>
        <S.SiderFooter>
          <UserProfile />
        </S.SiderFooter>
      </S.MenuSiderPanel>
    </S.Wrapper>
  );
});
