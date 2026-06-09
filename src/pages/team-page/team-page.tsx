import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import {
  getSelectedSectionNavPath,
  teamSectionNavItems,
} from "@/app/router/navigation";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const TeamPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      teamSectionNavItems.map((item) => ({
        key: item.path,
        label: t(item.labelKey),
      })),
    [t],
  );

  const selectedKey = useMemo(
    () => getSelectedSectionNavPath(teamSectionNavItems, location.pathname),
    [location.pathname],
  );

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t("team.shellTitle")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-team-primary-nav">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
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
