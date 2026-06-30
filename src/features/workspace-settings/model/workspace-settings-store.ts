import { makeAutoObservable, runInAction } from "mobx";

import { workspaceSettingsApi } from "@/features/workspace-settings/api/workspace-settings-api";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type {
  InventoryMode,
  WorkspaceCurrency,
} from "./workspace-settings.types";

export class WorkspaceSettingsStore {
  currency: WorkspaceCurrency | null = null;
  inventoryMode: InventoryMode | null = null;

  initialized = false;
  loadLoading = false;
  loadError: string | null = null;

  currencySaveLoading = false;
  inventoryModeSaveLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  loadSettings = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.loadLoading = true;
        this.loadError = null;
      });
    }

    try {
      const data = await workspaceSettingsApi.get();

      runInAction(() => {
        this.currency = data.currency;
        this.inventoryMode = data.inventoryMode;
        this.initialized = true;
        this.loadError = null;
      });
    } catch (e) {
      runInAction(() => {
        this.loadError = unknownErrorMessage(e);
      });
      throwLoadError("Failed to load workspace settings", e);
    } finally {
      if (!silent) {
        runInAction(() => {
          this.loadLoading = false;
        });
      }
    }
  };

  updateCurrency = async (currency: WorkspaceCurrency): Promise<void> => {
    if (this.currency === currency) {
      return;
    }

    const previousCurrency = this.currency;

    runInAction(() => {
      this.currency = currency;
      this.currencySaveLoading = true;
    });

    try {
      const data = await workspaceSettingsApi.update({ currency });

      runInAction(() => {
        if (data) {
          this.currency = data.currency;
          this.inventoryMode = data.inventoryMode;
        } else {
          this.currency = currency;
        }
      });
    } catch (e) {
      runInAction(() => {
        this.currency = previousCurrency;
      });
      throw e;
    } finally {
      runInAction(() => {
        this.currencySaveLoading = false;
      });
    }
  };

  updateInventoryMode = async (inventoryMode: InventoryMode): Promise<void> => {
    if (this.inventoryMode === inventoryMode || !this.currency) {
      return;
    }

    const previousInventoryMode = this.inventoryMode;
    const currency = this.currency;

    runInAction(() => {
      this.inventoryMode = inventoryMode;
      this.inventoryModeSaveLoading = true;
    });

    try {
      const data = await workspaceSettingsApi.update({
        currency,
        inventoryMode,
      });

      runInAction(() => {
        if (data) {
          this.inventoryMode = data.inventoryMode;
          this.currency = data.currency;
        } else {
          this.inventoryMode = inventoryMode;
        }
      });
    } catch (e) {
      runInAction(() => {
        this.inventoryMode = previousInventoryMode;
      });
      throw e;
    } finally {
      runInAction(() => {
        this.inventoryModeSaveLoading = false;
      });
    }
  };
}
