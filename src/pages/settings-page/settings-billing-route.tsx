import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsBillingPage } from "./mobile-settings-billing-page";
import { SettingsBillingView } from "./settings-billing-view";

export const SettingsBillingRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsBillingPage />}
    desktop={<SettingsBillingView />}
  />
);
