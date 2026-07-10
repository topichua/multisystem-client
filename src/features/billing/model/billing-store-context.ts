import { createContext } from "react";

import type { BillingStore } from "./billing-store";

export const BillingStoreContext = createContext<BillingStore | null>(null);
