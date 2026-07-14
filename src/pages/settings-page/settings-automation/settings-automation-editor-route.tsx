import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileSettingsAutomationEditorPage } from "./mobile-settings-automation-editor-page";
import { SettingsAutomationEditorView } from "./settings-automation-editor-view";

export const SettingsAutomationEditorRoute = () => (
  <ViewportRoute
    mobile={<MobileSettingsAutomationEditorPage />}
    desktop={<SettingsAutomationEditorView />}
  />
);
