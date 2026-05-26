import { useState, type ReactNode } from "react";

import { AiToolsStore } from "./ai-tools-store";
import { AiToolsStoreContext } from "./ai-tools-store-context";

type AiToolsProviderProps = {
  children: ReactNode;
};

export const AiToolsProvider = ({ children }: AiToolsProviderProps) => {
  const [store] = useState(() => new AiToolsStore());

  return (
    <AiToolsStoreContext.Provider value={store}>
      {children}
    </AiToolsStoreContext.Provider>
  );
};
