import { createContext } from "react";

import type { InventoryStore } from "./inventory-store";

export const InventoryStoreContext = createContext<InventoryStore | null>(null);
