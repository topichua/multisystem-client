import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileInventoryHistoryPage } from "./mobile-inventory-history-page";
import { ProductsInventoryHistoryPage } from "./products-inventory-history-page";

export const ProductsInventoryHistoryRoute = () => (
  <ViewportRoute
    mobile={<MobileInventoryHistoryPage />}
    desktop={<ProductsInventoryHistoryPage />}
  />
);
