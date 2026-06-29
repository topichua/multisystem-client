import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileCategoryDetailPage } from "./mobile-category-detail/mobile-category-detail-page";
import { ProductCategoryDetailView } from "./product-category-detail-view";

export const ProductCategoryDetailRoute = () => (
  <ViewportRoute
    mobile={<MobileCategoryDetailPage />}
    desktop={<ProductCategoryDetailView />}
  />
);
