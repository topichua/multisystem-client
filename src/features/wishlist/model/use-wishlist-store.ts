import { useContext } from "react";

import type { WishlistStore } from "./wishlist-store";
import { WishlistStoreContext } from "./wishlist-store-context";

export const useWishlistStore = (): WishlistStore => {
  const store = useContext(WishlistStoreContext);

  if (!store) {
    throw new Error("useWishlistStore must be used within WishlistProvider");
  }

  return store;
};
