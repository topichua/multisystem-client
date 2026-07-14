import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsAutomationListPage } from "./mobile-settings-automation-list-page";
import { SettingsAutomationListView } from "./settings-automation-list-view";

export const SettingsAutomationListRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsAutomationListPage />}
    desktop={<SettingsAutomationListView />}
  />
);
