import { createContext } from "react";

import type { WorkspaceRolesStore } from "./workspace-roles-store";

export const WorkspaceRolesStoreContext =
  createContext<WorkspaceRolesStore | null>(null);
