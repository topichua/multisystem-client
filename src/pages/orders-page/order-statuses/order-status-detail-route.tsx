import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileOrderStatusEditorPage } from "./mobile-order-statuses/mobile-order-status-editor-page";
import { OrderStatusDetailView } from "./order-status-detail-view";

export const OrderStatusDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileOrderStatusEditorPage />}
    desktop={<OrderStatusDetailView />}
  />
);
