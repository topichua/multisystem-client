import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import {
  getSelectedSectionNavPath,
  settingsSectionNavItems,
} from "@/app/router/navigation";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      settingsSectionNavItems.map((item) => ({
        key: item.path,
        label: t(item.labelKey),
      })),
    [t],
  );

  const selectedSettingsKey = useMemo(
    () => getSelectedSectionNavPath(settingsSectionNavItems, location.pathname),
    [location.pathname],
  );

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t("settings.title")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-settings-primary-nav">
            <Menu
              mode="inline"
              selectedKeys={[selectedSettingsKey]}
              items={menuItems}
              onClick={({ key }) => navigate(String(key))}
              style={{ borderInlineEnd: "none" }}
            />
          </div>
        </SettingsShell.SidebarScroll>
      </SettingsShell.Sidebar>
      <SettingsShell.Content>
        <Outlet />
      </SettingsShell.Content>
    </SettingsShell.Root>
  );
};
