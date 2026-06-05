import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import {
  getSelectedSectionNavPath,
  ordersSectionNavItems,
} from "@/app/router/navigation";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      ordersSectionNavItems.map((item) => ({
        key: item.path,
        label: t(item.labelKey),
      })),
    [t],
  );

  const selectedKey = useMemo(
    () => getSelectedSectionNavPath(ordersSectionNavItems, location.pathname),
    [location.pathname],
  );

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t("orders.shellTitle")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-orders-primary-nav">
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
