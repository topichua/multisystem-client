import { ViewportRoute } from "@/app/router/viewport-route";

import { RequireAdvancedInventory } from "../require-advanced-inventory";
import { MobileProductsSuppliesPage } from "./mobile-products-supplies-page";
import { ProductsSuppliesPage } from "./products-supplies-page";

export const ProductsSuppliesRoute = () => (
  <RequireAdvancedInventory>
    <ViewportRoute
      mobile={<MobileProductsSuppliesPage />}
      desktop={<ProductsSuppliesPage />}
    />
  </RequireAdvancedInventory>
);
