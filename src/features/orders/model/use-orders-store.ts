import { useContext } from "react";

import { OrdersStoreContext } from "./orders-store-context";
import type { OrdersStore } from "./orders-store";

export const useOrdersStore = (): OrdersStore => {
  const store = useContext(OrdersStoreContext);

  if (!store) {
    throw new Error("useOrdersStore must be used within OrdersProvider");
  }

  return store;
};
