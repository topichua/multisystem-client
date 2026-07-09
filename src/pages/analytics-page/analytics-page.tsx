import { Outlet } from "react-router";

import { SettingsShell } from "@/components/settings/settings-shell/settings-shell";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { AnalyticsSidebar } from "./components/analytics-sidebar";

export const AnalyticsPage = () => {
  const isMobileViewport = useIsMobileViewport();
  const outlet = <Outlet />;

  if (isMobileViewport) {
    return outlet;
  }

  return (
    <SettingsShell.Root>
      <SettingsShell.Sidebar $customWidth={240}>
        <AnalyticsSidebar />
      </SettingsShell.Sidebar>
      <SettingsShell.Content>{outlet}</SettingsShell.Content>
    </SettingsShell.Root>
  );
};
