import { createContext } from "react";

import type { ProductsStore } from "./products-store";

export const ProductsStoreContext = createContext<ProductsStore | null>(null);
