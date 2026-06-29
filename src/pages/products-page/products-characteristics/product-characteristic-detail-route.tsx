import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileCharacteristicDetailPage } from "./mobile-characteristic-detail/mobile-characteristic-detail-page";
import { ProductCharacteristicDetailView } from "./product-characteristic-detail-view";

export const ProductCharacteristicDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileCharacteristicDetailPage />}
    desktop={<ProductCharacteristicDetailView />}
  />
);
