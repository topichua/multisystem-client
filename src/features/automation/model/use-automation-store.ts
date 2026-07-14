import { useContext } from "react";

import type { AutomationStore } from "./automation-store";
import { AutomationStoreContext } from "./automation-store-context";

export const useAutomationStore = (): AutomationStore => {
  const store = useContext(AutomationStoreContext);

  if (!store) {
    throw new Error("useAutomationStore must be used within AutomationProvider");
  }

  return store;
};
