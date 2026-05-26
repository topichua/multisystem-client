import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/features/auth/model/use-auth";

import { UserStore } from "./user-store";
import { UserStoreContext } from "./user-store-context";

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [store] = useState(() => new UserStore());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      void store.loadAuth();
    } else {
      store.clearSession();
    }
  }, [isAuthenticated, store]);

  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  );
};
