import { ViewportRoute } from "@/app/router/viewport-route";

import { RequireAdvancedInventory } from "../require-advanced-inventory";
import { MobileInventoryHistoryPage } from "./mobile-inventory-history-page";
import { ProductsInventoryHistoryPage } from "./products-inventory-history-page";

export const ProductsInventoryHistoryRoute = () => (
  <RequireAdvancedInventory>
    <ViewportRoute
      mobile={<MobileInventoryHistoryPage />}
      desktop={<ProductsInventoryHistoryPage />}
    />
  </RequireAdvancedInventory>
);
