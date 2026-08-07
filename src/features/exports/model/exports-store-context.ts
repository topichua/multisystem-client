import { createContext } from "react";

import type { ExportsStore } from "./exports-store";

export const ExportsStoreContext = createContext<ExportsStore | null>(null);
