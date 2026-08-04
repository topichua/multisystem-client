import { useState, type ReactNode } from "react";

import { VariantWishlistClientsDrawer } from "@/features/wishlist/components/variant-wishlist-clients-drawer/variant-wishlist-clients-drawer";

import { VariantWishlistClientsStore } from "./variant-wishlist-clients-store";
import { VariantWishlistClientsStoreContext } from "./variant-wishlist-clients-store-context";
import { WishlistStore } from "./wishlist-store";
import { WishlistStoreContext } from "./wishlist-store-context";

type WishlistProviderProps = {
  children: ReactNode;
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [store] = useState(() => new WishlistStore());
  const [variantWishlistClientsStore] = useState(
    () => new VariantWishlistClientsStore(),
  );

  return (
    <WishlistStoreContext.Provider value={store}>
      <VariantWishlistClientsStoreContext.Provider
        value={variantWishlistClientsStore}
      >
        {children}
        <VariantWishlistClientsDrawer />
      </VariantWishlistClientsStoreContext.Provider>
    </WishlistStoreContext.Provider>
  );
};
