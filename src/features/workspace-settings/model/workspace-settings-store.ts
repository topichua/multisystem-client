import { makeAutoObservable, runInAction } from "mobx";

import { workspaceSettingsApi } from "@/features/workspace-settings/api/workspace-settings-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { WorkspaceCurrency } from "./workspace-settings.types";

export class WorkspaceSettingsStore {
  workspaceId: number | null = null;
  currency: WorkspaceCurrency | null = null;

  initialized = false;
  loadLoading = false;
  loadError: string | null = null;

  saveLoading = false;
  saveError: string | null = null;

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
        this.workspaceId = data.workspaceId;
        this.currency = data.currency;
        this.initialized = true;
        this.loadError = null;
      });
    } catch (e) {
      runInAction(() => {
        this.loadError = unknownErrorMessage(e);
      });
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
      this.saveLoading = true;
      this.saveError = null;
    });

    try {
      const data = await workspaceSettingsApi.update({ currency });

      runInAction(() => {
        if (data) {
          this.workspaceId = data.workspaceId;
          this.currency = data.currency;
        } else {
          this.currency = currency;
        }
      });
    } catch (e) {
      runInAction(() => {
        this.currency = previousCurrency;
        this.saveError = unknownErrorMessage(e);
      });
      throw e;
    } finally {
      runInAction(() => {
        this.saveLoading = false;
      });
    }
  };
}
