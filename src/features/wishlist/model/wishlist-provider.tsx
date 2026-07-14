import { useState, type ReactNode } from "react";

import { WishlistStore } from "./wishlist-store";
import { WishlistStoreContext } from "./wishlist-store-context";

type WishlistProviderProps = {
  children: ReactNode;
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [store] = useState(() => new WishlistStore());

  return (
    <WishlistStoreContext.Provider value={store}>
      {children}
    </WishlistStoreContext.Provider>
  );
};
