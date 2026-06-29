import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTeamRoleEditorPage } from "./mobile-team-roles/mobile-team-role-editor-page";
import { TeamRoleDetailView } from "./team-role-detail-view";

export const TeamRoleDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileTeamRoleEditorPage />}
    desktop={<TeamRoleDetailView />}
  />
);
