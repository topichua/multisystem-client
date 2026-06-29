import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTeamMembersPage } from "./mobile-team-members/mobile-team-members-page";
import { TeamMembersPage } from "./team-members-page";

export const TeamMembersRoute = () => (
  <ViewportRoute
    mobile={<MobileTeamMembersPage />}
    desktop={<TeamMembersPage />}
  />
);
