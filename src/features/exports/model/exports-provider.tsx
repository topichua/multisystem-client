import { useEffect, useState, type ReactNode } from "react";

import { ExportsStore } from "./exports-store";
import { ExportsStoreContext } from "./exports-store-context";

type ExportsProviderProps = {
  children: ReactNode;
};

export const ExportsProvider = ({ children }: ExportsProviderProps) => {
  const [store] = useState(() => new ExportsStore());

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, [store]);

  return (
    <ExportsStoreContext.Provider value={store}>
      {children}
    </ExportsStoreContext.Provider>
  );
};
