import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileProductsCategoriesPage } from "./mobile-products-categories/mobile-products-categories-page";
import { ProductsCategoriesPage } from "./products-categories-page";

export const ProductsCategoriesRoute = () => (
  <ViewportRoute
    mobile={<MobileProductsCategoriesPage />}
    desktop={<ProductsCategoriesPage />}
  />
);
