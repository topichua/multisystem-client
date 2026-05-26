import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: pagesMap.settingsGroups, label: t("settings.menu.groups") },
      { key: pagesMap.settingsUser, label: t("settings.menu.user") },
      { key: pagesMap.settingsSystem, label: t("settings.menu.system") },
      {
        key: pagesMap.settingsIntegrations,
        label: t("settings.menu.integrations"),
      },
    ],
    [t],
  );

  const selectedSettingsKey = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith(pagesMap.settingsUser)) {
      return pagesMap.settingsUser;
    }
    if (path.startsWith(pagesMap.settingsSystem)) {
      return pagesMap.settingsSystem;
    }
    if (path.startsWith(pagesMap.settingsIntegrations)) {
      return pagesMap.settingsIntegrations;
    }
    return pagesMap.settingsGroups;
  }, [location.pathname]);

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
