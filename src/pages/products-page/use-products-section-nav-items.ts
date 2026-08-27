import { useEffect } from "react";

import {
  getVisibleProductsSectionNavItems,
  type ProductsSectionNavItem,
} from "@/app/router/navigation";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";

export const useProductsSectionNavItems =
  (): readonly ProductsSectionNavItem[] => {
    const workspaceSettingsStore = useWorkspaceSettingsStore();

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings({ silent: true });
      }
    }, [workspaceSettingsStore]);

    return getVisibleProductsSectionNavItems(
      workspaceSettingsStore.inventoryMode === InventoryMode.advanced,
    );
  };
