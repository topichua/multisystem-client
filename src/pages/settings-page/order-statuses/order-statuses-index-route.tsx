import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileOrderStatusesListPage } from "./mobile-order-statuses/mobile-order-statuses-list-page";
import { OrderStatusesIndex } from "./order-statuses-index";

export const OrderStatusesIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileOrderStatusesListPage />}
    desktop={<OrderStatusesIndex />}
  />
);
