import { useState, type ReactNode } from "react";

import { InventoryStore } from "./inventory-store";
import { InventoryStoreContext } from "./inventory-store-context";

type InventoryProviderProps = {
  children: ReactNode;
};

export const InventoryProvider = ({ children }: InventoryProviderProps) => {
  const [store] = useState(() => new InventoryStore());

  return (
    <InventoryStoreContext.Provider value={store}>
      {children}
    </InventoryStoreContext.Provider>
  );
};
