import { ViewportRoute } from "@/app/router/viewport-route";

import { ClientDetailsPage } from "./client-details-page";

export const ClientDetailRoute = () => (
  <ViewportRoute
    mobile={<ClientDetailsPage />}
    desktop={<ClientDetailsPage />}
  />
);
