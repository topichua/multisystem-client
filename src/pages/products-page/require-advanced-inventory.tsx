import { observer } from "mobx-react-lite";
import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";

type RequireAdvancedInventoryProps = {
  children: ReactNode;
};

export const RequireAdvancedInventory = observer(
  ({ children }: RequireAdvancedInventoryProps) => {
    const workspaceSettingsStore = useWorkspaceSettingsStore();

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings({ silent: true });
      }
    }, [workspaceSettingsStore]);

    if (!workspaceSettingsStore.initialized) {
      return null;
    }

    if (workspaceSettingsStore.inventoryMode !== InventoryMode.advanced) {
      return <Navigate to={pagesMap.productsList} replace />;
    }

    return <>{children}</>;
  },
);
