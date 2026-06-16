import { useContext } from "react";

import { WorkspaceRolesStoreContext } from "./workspace-roles-store-context";
import type { WorkspaceRolesStore } from "./workspace-roles-store";

export const useWorkspaceRolesStore = (): WorkspaceRolesStore => {
  const store = useContext(WorkspaceRolesStoreContext);

  if (!store) {
    throw new Error(
      "useWorkspaceRolesStore must be used within WorkspaceRolesProvider",
    );
  }

  return store;
};
