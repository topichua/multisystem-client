import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsHubPage } from "./mobile-settings-hub/mobile-settings-hub-page";

export const SettingsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsHubPage />}
    desktop={<Navigate to={pagesMap.settingsGroups} replace />}
  />
);
