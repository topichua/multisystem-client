import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsIntegrationsPage } from "./mobile-settings-integrations-page";
import { SettingsIntegrationsPage } from "./settings-integrations-page";

export const SettingsIntegrationsRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsIntegrationsPage />}
    desktop={<SettingsIntegrationsPage />}
  />
);
