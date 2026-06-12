import { useContext } from "react";

import type { InstagramStore } from "./instagram-store";
import { InstagramStoreContext } from "./instagram-store-context";

export const useInstagramStore = (): InstagramStore => {
  const store = useContext(InstagramStoreContext);

  if (!store) {
    throw new Error("useInstagramStore must be used within InstagramProvider");
  }

  return store;
};
