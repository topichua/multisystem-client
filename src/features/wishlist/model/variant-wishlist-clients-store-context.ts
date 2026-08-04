import { createContext } from "react";

import type { VariantWishlistClientsStore } from "./variant-wishlist-clients-store";

export const VariantWishlistClientsStoreContext =
  createContext<VariantWishlistClientsStore | null>(null);
