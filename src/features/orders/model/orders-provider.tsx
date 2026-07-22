import { useEffect, useState, type ReactNode } from "react";

import { OrdersStoreContext } from "./orders-store-context";
import { OrdersStore } from "./orders-store";

type OrdersProviderProps = {
  children: ReactNode;
};

export const OrdersProvider = ({ children }: OrdersProviderProps) => {
  const [store, setStore] = useState(() => new OrdersStore());

  useEffect(() => {
    if (!import.meta.hot) {
      return;
    }

    import.meta.hot.accept("./orders-store.ts", () => {
      setStore(new OrdersStore());
    });
  }, []);

  return (
    <OrdersStoreContext.Provider value={store}>
      {children}
    </OrdersStoreContext.Provider>
  );
};
