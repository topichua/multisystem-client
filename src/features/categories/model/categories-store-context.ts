import { createContext } from "react";

import type { CategoriesStore } from "./categories-store";

export const CategoriesStoreContext = createContext<CategoriesStore | null>(
  null,
);
