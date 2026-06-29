import { CaretLeftIcon } from "@phosphor-icons/react";
import { Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import {
  mainNavItems,
  isNavItemActive,
  type MainNavItem,
} from "@/app/router/navigation";
import { pagesMap } from "@/app/router/pages-map";

import { ThemePreferenceControl } from "../theme-preference-control/theme-preference-control";
import { UserProfile } from "../user-profile/user-profile";
import {
  readStoredAppSiderExpanded,
  writeStoredAppSiderExpanded,
} from "./app-sider-expanded-storage";
import * as S from "./app-sider.styled";
import { useLocalStorageSync } from "@/utils/use-local-storage-sync";

const { Text } = Typography;

const primaryNavItems = mainNavItems.filter((item) => item.key !== "settings");
const settingsNavItem = mainNavItems.find((item) => item.key === "settings");

type MenuSiderProps = {
  showLabel: boolean;
  items: readonly MainNavItem[];
};

const SiderNavItems = observer(({ showLabel, items }: MenuSiderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {items.map((item) => {
        const isActive = isNavItemActive(item, location.pathname);
        const qaKey = item.path.replace(/\//g, "_").replace(/^_/, "") || "root";

        return (
          <S.Button
            key={item.path}
            icon={item.icon}
            className={isActive ? "active" : ""}
            onClick={() => {
              navigate(item.path);
            }}
            block
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
    </>
  );
});

const MenuSiderMain = observer((props: MenuSiderProps) => (
  <S.MenuSider $showLabel={props.showLabel}>
    <SiderNavItems {...props} />
  </S.MenuSider>
));

export const AppSider = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(readStoredAppSiderExpanded);

  const openSider = () => {
    writeStoredAppSiderExpanded(true);
    setIsExpanded(true);
  };

  const closeSider = () => {
    writeStoredAppSiderExpanded(false);
    setIsExpanded(false);
  };

  const handleBrandClick = () => {
    if (isExpanded) {
      navigate(pagesMap.home);
      return;
    }

    openSider();
  };

  useLocalStorageSync("multisale.appSiderExpanded", (newValue) => {
    if (newValue === "true") setIsExpanded(true);
    if (newValue === "false") setIsExpanded(false);
  });

  const handleBrandKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleBrandClick();
  };

  return (
    <S.Wrapper $isExpanded={isExpanded}>
      <S.MenuSiderPanel $isExpanded={isExpanded} aria-expanded={isExpanded}>
        <S.SiderScrollArea>
          <S.PanelHeader $showLabel={isExpanded}>
            <S.Brand
              $showLabel={isExpanded}
              $interactive
              role="button"
              tabIndex={0}
              aria-label={
                isExpanded ? t("nav.homeAria") : t("nav.expandSiderAria")
              }
              aria-expanded={isExpanded ? undefined : false}
              onClick={handleBrandClick}
              onKeyDown={handleBrandKeyDown}
            >
              <S.BrandLogoSlot>
                <S.BrandLogo src="/logos/logo.png" alt={`${t("brand")} icon`} />
              </S.BrandLogoSlot>
              {isExpanded && <S.BrandLogoText>{t("brand")}</S.BrandLogoText>}
            </S.Brand>
            {isExpanded && (
              <S.CollapseButton
                type="text"
                aria-label={t("nav.collapseSiderAria")}
                icon={<CaretLeftIcon size={18} />}
                onClick={closeSider}
              />
            )}
          </S.PanelHeader>
          <MenuSiderMain showLabel={isExpanded} items={primaryNavItems} />
        </S.SiderScrollArea>
        <S.SiderFooter>
          <ThemePreferenceControl variant="sider" showLabel={isExpanded} />
          {settingsNavItem && (
            <S.FooterNav $showLabel={isExpanded}>
              <SiderNavItems showLabel={isExpanded} items={[settingsNavItem]} />
            </S.FooterNav>
          )}
          <UserProfile collapsed={!isExpanded} />
        </S.SiderFooter>
      </S.MenuSiderPanel>
    </S.Wrapper>
  );
});
