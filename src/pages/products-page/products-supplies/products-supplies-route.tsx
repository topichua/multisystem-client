import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileProductsSuppliesPage } from "./mobile-products-supplies-page";
import { ProductsSuppliesPage } from "./products-supplies-page";

export const ProductsSuppliesRoute = () => (
  <ViewportRoute
    mobile={<MobileProductsSuppliesPage />}
    desktop={<ProductsSuppliesPage />}
  />
);
