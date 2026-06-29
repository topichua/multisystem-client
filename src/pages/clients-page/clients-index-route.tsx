import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileClientsHubPage } from "./mobile-clients-hub/mobile-clients-hub-page";

export const ClientsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileClientsHubPage />}
    desktop={<Navigate to={pagesMap.clientsWorkspace} replace />}
  />
);
