import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import {
  analyticsSectionNavItems,
  getSelectedSectionNavPath,
} from "@/app/router/navigation";
import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";

import { AnalyticsProBadge } from "./analytics-pro-badge.styled";
import * as S from "./analytics-sidebar.styled";

export const AnalyticsSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPath = useMemo(
    () =>
      getSelectedSectionNavPath(analyticsSectionNavItems, location.pathname),
    [location.pathname],
  );

  return (
    <>
      <SettingsShell.Title>{t("analytics.pageTitle")}</SettingsShell.Title>
      <SettingsShell.SidebarScroll>
        <S.NavList>
          {analyticsSectionNavItems.map((item) => {
            const isActive = item.path === selectedPath;

            return (
              <S.NavItem
                key={item.key}
                type="button"
                $active={isActive}
                aria-current={isActive ? "page" : undefined}
                data-qa={`analytics-nav-item-${item.key}`}
                onClick={() => navigate(item.path)}
              >
                <S.NavItemLabel>{t(item.labelKey)}</S.NavItemLabel>
                {"pro" in item && item.pro && (
                  <AnalyticsProBadge>
                    {t("analytics.menu.proBadge")}
                  </AnalyticsProBadge>
                )}
              </S.NavItem>
            );
          })}
        </S.NavList>
      </SettingsShell.SidebarScroll>
    </>
  );
};
