import { createContext } from "react";

import type { WorkspaceMembersStore } from "./workspace-members-store";

export const WorkspaceMembersStoreContext =
  createContext<WorkspaceMembersStore | null>(null);
