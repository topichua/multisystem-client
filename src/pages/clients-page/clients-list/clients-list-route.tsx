import { ViewportRoute } from "@/app/router/viewport-route";

import { ClientsListPage } from "./clients-list-page";
import { MobileClientsListPage } from "./mobile-clients-list/mobile-clients-list-page";

export const ClientsListRoute = () => (
  <ViewportRoute
    mobile={<MobileClientsListPage />}
    desktop={<ClientsListPage />}
  />
);
