import { useContext } from "react";

import type { InventoryStore } from "./inventory-store";
import { InventoryStoreContext } from "./inventory-store-context";

export const useInventoryStore = (): InventoryStore => {
  const store = useContext(InventoryStoreContext);

  if (!store) {
    throw new Error("useInventoryStore must be used within InventoryProvider");
  }

  return store;
};
