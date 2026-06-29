import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileCharacteristicsListPage } from "./mobile-characteristics-list/mobile-characteristics-list-page";
import { ProductsCharacteristicsIndex } from "./products-characteristics-index";

export const ProductsCharacteristicsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileCharacteristicsListPage />}
    desktop={<ProductsCharacteristicsIndex />}
  />
);
