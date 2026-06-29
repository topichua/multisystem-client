import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileProductsListPage } from "./mobile-products-list/mobile-products-list-page";
import { ProductsListPage } from "./products-list-page";

export const ProductsListRoute = () => (
  <ViewportRoute
    mobile={<MobileProductsListPage />}
    desktop={<ProductsListPage />}
  />
);
