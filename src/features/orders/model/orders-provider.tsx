import { useState, type ReactNode } from "react";

import { OrdersStoreContext } from "./orders-store-context";
import { OrdersStore } from "./orders-store";

type OrdersProviderProps = {
  children: ReactNode;
};

export const OrdersProvider = ({ children }: OrdersProviderProps) => {
  const [store] = useState(() => new OrdersStore());

  return (
    <OrdersStoreContext.Provider value={store}>
      {children}
    </OrdersStoreContext.Provider>
  );
};
