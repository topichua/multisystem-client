import { createContext } from "react";

import type { WishlistStore } from "./wishlist-store";

export const WishlistStoreContext = createContext<WishlistStore | null>(null);
