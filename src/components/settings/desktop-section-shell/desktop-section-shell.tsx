import type { MenuProps } from "antd";
import { Menu } from "antd";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import {
  getSelectedSectionNavPath,
  type SectionNavItem,
} from "@/app/router/navigation";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { SettingsShell } from "../settings-shell/settings-shell";

type DesktopSectionShellProps = {
  items: readonly SectionNavItem[];
  navDataQa: string;
  titleKey: string;
  mobileWrapper?: (children: ReactNode) => ReactNode;
};

export const DesktopSectionShell = ({
  items,
  navDataQa,
  titleKey,
  mobileWrapper,
}: DesktopSectionShellProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileViewport = useIsMobileViewport();
  const outlet = <Outlet />;

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      items.map((item) => ({
        key: item.path,
        label: t(item.labelKey),
      })),
    [items, t],
  );

  const selectedKey = useMemo(
    () => getSelectedSectionNavPath(items, location.pathname),
    [items, location.pathname],
  );

  if (isMobileViewport) {
    return <>{mobileWrapper ? mobileWrapper(outlet) : outlet}</>;
  }

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar>
        <SettingsShell.Title>{t(titleKey)}</SettingsShell.Title>
        <SettingsShell.SidebarScroll>
          <div data-qa={navDataQa}>
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
      <SettingsShell.Content>{outlet}</SettingsShell.Content>
    </SettingsShell.Root>
  );
};
