import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

export const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: pagesMap.productsList, label: t("products.listTitle") },
      { key: pagesMap.productsCategories, label: t("categories.title") },
      {
        key: pagesMap.productsCharacteristics,
        label: t("characteristics.title"),
      },
    ],
    [t],
  );

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith(pagesMap.productsList)) {
      return pagesMap.productsList;
    }

    if (location.pathname.startsWith(pagesMap.productsCategories)) {
      return pagesMap.productsCategories;
    }

    if (location.pathname.startsWith(pagesMap.productsCharacteristics)) {
      return pagesMap.productsCharacteristics;
    }

    return pagesMap.productsList;
  }, [location.pathname]);

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t("products.shellTitle")}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa="layout-products-primary-nav">
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
