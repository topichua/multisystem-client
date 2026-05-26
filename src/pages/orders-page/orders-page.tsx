import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: pagesMap.ordersList, label: t("orders.listTitle") },
      { key: pagesMap.ordersStatuses, label: t("orders.menu.statuses") },
    ],
    [t],
  );

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith(pagesMap.ordersStatuses)) {
      return pagesMap.ordersStatuses;
    }

    if (location.pathname.startsWith(pagesMap.ordersList)) {
      return pagesMap.ordersList;
    }

    return pagesMap.ordersList;
  }, [location.pathname]);

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
