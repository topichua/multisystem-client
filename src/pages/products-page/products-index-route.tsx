import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileProductsHubPage } from "./mobile-products-hub/mobile-products-hub-page";

export const ProductsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileProductsHubPage />}
    desktop={<Navigate to={pagesMap.productsList} replace />}
  />
);
