import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ViewportRoute } from "@/app/router/viewport-route";

import { MobileAnalyticsHubPage } from "./mobile-analytics-hub/mobile-analytics-hub-page";

export const AnalyticsIndexRoute = () => (
  <ViewportRoute
    mobile={<MobileAnalyticsHubPage />}
    desktop={<Navigate to={pagesMap.analyticsOverview} replace />}
  />
);
