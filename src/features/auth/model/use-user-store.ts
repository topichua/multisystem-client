import { useContext } from "react";

import type { UserStore } from "./user-store";

import { UserStoreContext } from "./user-store-context";

export const useUserStore = (): UserStore => {
  const store = useContext(UserStoreContext);

  if (!store) {
    throw new Error("useUserStore must be used within UserProvider");
  }

  return store;
};
