import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileCategoriesListPage } from "./mobile-categories-list/mobile-categories-list-page";
import { ProductsCategoriesIndex } from "./products-categories-index";

export const ProductsCategoriesIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileCategoriesListPage />}
    desktop={<ProductsCategoriesIndex />}
  />
);
