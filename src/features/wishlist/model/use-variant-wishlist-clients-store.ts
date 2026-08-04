import { useContext } from "react";

import type { VariantWishlistClientsStore } from "./variant-wishlist-clients-store";
import { VariantWishlistClientsStoreContext } from "./variant-wishlist-clients-store-context";

export const useVariantWishlistClientsStore =
  (): VariantWishlistClientsStore => {
    const store = useContext(VariantWishlistClientsStoreContext);

    if (!store) {
      throw new Error(
        "useVariantWishlistClientsStore must be used within WishlistProvider",
      );
    }

    return store;
  };
