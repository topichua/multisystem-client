import { useState, type ReactNode } from "react";

import { CategoriesStoreContext } from "./categories-store-context";
import { CategoriesStore } from "./categories-store";

type CategoriesProviderProps = {
  children: ReactNode;
};

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [store] = useState(() => new CategoriesStore());

  return (
    <CategoriesStoreContext.Provider value={store}>
      {children}
    </CategoriesStoreContext.Provider>
  );
};
