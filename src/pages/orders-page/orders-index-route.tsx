import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileOrdersHubPage } from "./mobile-orders-hub/mobile-orders-hub-page";

export const OrdersIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileOrdersHubPage />}
    desktop={<Navigate to={pagesMap.ordersList} replace />}
  />
);
