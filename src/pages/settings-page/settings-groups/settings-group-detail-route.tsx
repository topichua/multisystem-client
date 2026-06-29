import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileGroupEditorPage } from "./mobile-group-editor-page";
import { SettingsGroupDetailView } from "./settings-group-detail-view";

export const SettingsGroupDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileGroupEditorPage />}
    desktop={<SettingsGroupDetailView />}
  />
);
