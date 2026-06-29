import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsSystemPage } from "./mobile-settings-system-page";
import { SettingsSystemView } from "./settings-system-view";

export const SettingsSystemRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsSystemPage />}
    desktop={<SettingsSystemView />}
  />
);
