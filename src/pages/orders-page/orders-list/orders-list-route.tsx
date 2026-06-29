import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileOrdersListPage } from "./mobile-orders-list/mobile-orders-list-page";
import { OrdersListPage } from "./orders-list-page";

export const OrdersListRoute = () => (
  <ViewportRoute
    mobile={<MobileOrdersListPage />}
    desktop={<OrdersListPage />}
  />
);
