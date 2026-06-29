import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTemplatesListPage } from "./mobile-templates-list-page";
import { SettingsTemplatesIndex } from "./settings-templates-index";

export const SettingsTemplatesIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileTemplatesListPage />}
    desktop={<SettingsTemplatesIndex />}
  />
);
