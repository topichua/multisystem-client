import { useState, type ReactNode } from "react";

import { AnalyticsStoreContext } from "./analytics-store-context";
import { AnalyticsStore } from "./analytics-store";

type AnalyticsProviderProps = {
  children: ReactNode;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [store] = useState(() => new AnalyticsStore());

  return (
    <AnalyticsStoreContext.Provider value={store}>
      {children}
    </AnalyticsStoreContext.Provider>
  );
};
