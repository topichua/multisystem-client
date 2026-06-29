import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileGroupsListPage } from "./mobile-groups-list-page";
import { SettingsGroupsIndex } from "./settings-groups-index";

export const SettingsGroupsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileGroupsListPage />}
    desktop={<SettingsGroupsIndex />}
  />
);
