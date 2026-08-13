import { Navigate } from "react-router";

import { settingsSectionNavItems } from "@/app/router/navigation";
import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsHubPage } from "./mobile-settings-hub/mobile-settings-hub-page";

const firstSettingsPath =
  settingsSectionNavItems[0]?.path ?? pagesMap.settingsUser;

export const SettingsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsHubPage />}
    desktop={<Navigate to={firstSettingsPath} replace />}
  />
);
