import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import {
  clientsSectionNavItems,
  getSelectedSectionNavPath,
} from "@/app/router/navigation";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const ClientsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      clientsSectionNavItems.map((item) => ({
        key: item.path,
        label: t(item.labelKey),
      })),
    [t],
  );

  const selectedKey = useMemo(
    () => getSelectedSectionNavPath(clientsSectionNavItems, location.pathname),
    [location.pathname],
  );

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t("clients.shellTitle")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-clients-primary-nav">
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
