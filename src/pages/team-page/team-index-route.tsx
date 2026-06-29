import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileTeamHubPage } from "./mobile-team-hub/mobile-team-hub-page";

export const TeamIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileTeamHubPage />}
    desktop={<Navigate to={pagesMap.teamMembers} replace />}
  />
);
