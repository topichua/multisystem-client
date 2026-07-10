import { useContext } from "react";

import { BillingStoreContext } from "./billing-store-context";
import type { BillingStore } from "./billing-store";

export const useBillingStore = (): BillingStore => {
  const store = useContext(BillingStoreContext);

  if (!store) {
    throw new Error("useBillingStore must be used within BillingProvider");
  }

  return store;
};
