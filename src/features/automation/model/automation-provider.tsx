import { useState, type ReactNode } from "react";

import { AutomationStore } from "./automation-store";
import { AutomationStoreContext } from "./automation-store-context";

type AutomationProviderProps = {
  children: ReactNode;
};

export const AutomationProvider = ({ children }: AutomationProviderProps) => {
  const [store] = useState(() => new AutomationStore());

  return (
    <AutomationStoreContext.Provider value={store}>
      {children}
    </AutomationStoreContext.Provider>
  );
};
