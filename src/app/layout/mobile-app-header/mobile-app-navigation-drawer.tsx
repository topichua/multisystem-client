import type { MenuProps } from "antd";
import { Drawer, Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import {
  getSelectedMobileNavKey,
  mobileNavItems,
  mobileNavSections,
  type MobileNavItem,
} from "@/app/router/navigation";
import { ThemePreferenceControl } from "@/app/layout/theme-preference-control/theme-preference-control";

import * as S from "./mobile-app-header.styled";

type MobileAppNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (item: MobileNavItem) => void;
};

export const MobileAppNavigationDrawer = ({
  open,
  onClose,
  onNavigate,
}: MobileAppNavigationDrawerProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const selectedKey = getSelectedMobileNavKey(location.pathname);

  const menuItems = useMemo<MenuProps["items"]>(
    () =>
      mobileNavSections.map((section) => ({
        type: "group",
        key: section.key,
        label: (
          <S.DrawerSectionLabel>{t(section.titleKey)}</S.DrawerSectionLabel>
        ),
        children: section.items.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <S.DrawerMenuLabel
              data-qa={`layout-mobile-navigation-item-${item.key}`}
            >
              {t(item.labelKey)}
            </S.DrawerMenuLabel>
          ),
        })),
      })),
    [t],
  );

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    const item = mobileNavItems.find((navItem) => navItem.key === key);

    if (!item) {
      return;
    }

    onNavigate(item);
  };

  return (
    <Drawer
      placement="left"
      open={open}
      width="min(320px, 88vw)"
      closable={{
        "aria-label": t("nav.closeMobileNavigationAria"),
        placement: "end",
      }}
      title={<S.DrawerTitle>{t("nav.mobileNavigationTitle")}</S.DrawerTitle>}
      onClose={onClose}
      styles={{
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <S.DrawerContent>
        <S.DrawerNavScroll>
          <Menu
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderInlineEnd: "none" }}
          />
        </S.DrawerNavScroll>
        <S.DrawerFooter>
          <S.DrawerThemeDivider />
          <ThemePreferenceControl variant="drawer" />
        </S.DrawerFooter>
      </S.DrawerContent>
    </Drawer>
  );
};
