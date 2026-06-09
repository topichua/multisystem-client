import { useState, type ReactNode } from "react";

import { WorkspaceMembersStoreContext } from "./workspace-members-store-context";
import { WorkspaceMembersStore } from "./workspace-members-store";

type WorkspaceMembersProviderProps = {
  children: ReactNode;
};

export const WorkspaceMembersProvider = ({
  children,
}: WorkspaceMembersProviderProps) => {
  const [store] = useState(() => new WorkspaceMembersStore());

  return (
    <WorkspaceMembersStoreContext.Provider value={store}>
      {children}
    </WorkspaceMembersStoreContext.Provider>
  );
};
