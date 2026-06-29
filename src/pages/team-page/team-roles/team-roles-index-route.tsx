import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTeamRolesListPage } from "./mobile-team-roles/mobile-team-roles-list-page";
import { TeamRolesIndex } from "./team-roles-index";

export const TeamRolesIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileTeamRolesListPage />}
    desktop={<TeamRolesIndex />}
  />
);
