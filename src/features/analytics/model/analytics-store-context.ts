import { createContext } from "react";

import type { AnalyticsStore } from "./analytics-store";

export const AnalyticsStoreContext = createContext<AnalyticsStore | null>(null);
