import { createContext } from "react";

import type { ClientsStore } from "./clients-store";

export const ClientsStoreContext = createContext<ClientsStore | null>(null);
