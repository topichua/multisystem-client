import { useContext } from "react";

import { WorkspaceMembersStoreContext } from "./workspace-members-store-context";
import type { WorkspaceMembersStore } from "./workspace-members-store";

export const useWorkspaceMembersStore = (): WorkspaceMembersStore => {
  const store = useContext(WorkspaceMembersStoreContext);

  if (!store) {
    throw new Error(
      "useWorkspaceMembersStore must be used within WorkspaceMembersProvider",
    );
  }

  return store;
};
