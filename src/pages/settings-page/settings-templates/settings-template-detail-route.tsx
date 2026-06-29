import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTemplateEditorPage } from "./mobile-template-editor-page";
import { SettingsTemplateDetailView } from "./settings-template-detail-view";

export const SettingsTemplateDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileTemplateEditorPage />}
    desktop={<SettingsTemplateDetailView />}
  />
);
