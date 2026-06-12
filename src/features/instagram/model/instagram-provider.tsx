import { useState, type ReactNode } from "react";

import { InstagramStore } from "./instagram-store";
import { InstagramStoreContext } from "./instagram-store-context";

type InstagramProviderProps = {
  children: ReactNode;
};

export const InstagramProvider = ({ children }: InstagramProviderProps) => {
  const [store] = useState(() => new InstagramStore());

  return (
    <InstagramStoreContext.Provider value={store}>
      {children}
    </InstagramStoreContext.Provider>
  );
};
