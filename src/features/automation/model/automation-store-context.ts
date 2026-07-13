import { createContext } from "react";

import type { AutomationStore } from "./automation-store";

export const AutomationStoreContext = createContext<AutomationStore | null>(
  null,
);
