import { useContext } from "react";

import { AnalyticsStoreContext } from "./analytics-store-context";
import type { AnalyticsStore } from "./analytics-store";

export const useAnalyticsStore = (): AnalyticsStore => {
  const store = useContext(AnalyticsStoreContext);

  if (!store) {
    throw new Error("useAnalyticsStore must be used within AnalyticsProvider");
  }

  return store;
};
