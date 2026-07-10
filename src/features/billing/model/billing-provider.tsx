import { useState, type ReactNode } from "react";

import { BillingStore } from "./billing-store";
import { BillingStoreContext } from "./billing-store-context";

type BillingProviderProps = {
  children: ReactNode;
};

export const BillingProvider = ({ children }: BillingProviderProps) => {
  const [store] = useState(() => new BillingStore());

  return (
    <BillingStoreContext.Provider value={store}>
      {children}
    </BillingStoreContext.Provider>
  );
};
