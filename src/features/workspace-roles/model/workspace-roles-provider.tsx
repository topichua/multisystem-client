import { useState, type ReactNode } from "react";

import { WorkspaceRolesStoreContext } from "./workspace-roles-store-context";
import { WorkspaceRolesStore } from "./workspace-roles-store";

type WorkspaceRolesProviderProps = {
  children: ReactNode;
};

export const WorkspaceRolesProvider = ({
  children,
}: WorkspaceRolesProviderProps) => {
  const [store] = useState(() => new WorkspaceRolesStore());

  return (
    <WorkspaceRolesStoreContext.Provider value={store}>
      {children}
    </WorkspaceRolesStoreContext.Provider>
  );
};
