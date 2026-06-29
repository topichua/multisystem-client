import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsUserPage } from "./mobile-settings-user-page";
import { SettingsUserView } from "./settings-user-view";

export const SettingsUserRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsUserPage />}
    desktop={<SettingsUserView />}
  />
);
