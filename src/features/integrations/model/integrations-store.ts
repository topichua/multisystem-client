import { makeAutoObservable, runInAction } from "mobx";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { IntegrationItem, IntegrationType } from "./integration.types";

const INTEGRATION_NOT_AVAILABLE_ERROR = "INTEGRATION_NOT_AVAILABLE";

export const isIntegrationNotAvailableError = (error: unknown): boolean =>
  error instanceof Error && error.message === INTEGRATION_NOT_AVAILABLE_ERROR;

export const CONNECTABLE_INTEGRATION_TYPES = [
  "instagram",
  "telegram",
] as const satisfies readonly IntegrationType[];

export type ConnectableIntegrationType =
  (typeof CONNECTABLE_INTEGRATION_TYPES)[number];

export const isConnectableIntegrationType = (
  type: string,
): type is ConnectableIntegrationType =>
  (CONNECTABLE_INTEGRATION_TYPES as readonly string[]).includes(type);

export class IntegrationsStore {
  workspaceId: number | null = null;
  items: IntegrationItem[] = [];

  listLoading = false;
  listError: string | null = null;

  connectLoading = false;
  disconnectLoadingKey: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private disconnectKey(type: IntegrationType, id: number): string {
    return `${type}:${id}`;
  }

  isDisconnecting(type: IntegrationType, id: number): boolean {
    return this.disconnectLoadingKey === this.disconnectKey(type, id);
  }

  loadIntegrations = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
        this.listError = null;
      });
    }

    try {
      const data = await integrationsApi.list();
      runInAction(() => {
        this.workspaceId = data.workspaceId;
        this.items = Array.isArray(data.items) ? data.items : [];
      });
    } catch (e) {
      runInAction(() => {
        this.listError = unknownErrorMessage(e);
      });
    } finally {
      if (!silent) {
        runInAction(() => {
          this.listLoading = false;
        });
      }
    }
  };

  connectIntegration = async (
    integration_type: string,
  ): Promise<IntegrationItem> => {
    if (!isConnectableIntegrationType(integration_type)) {
      throw new Error(INTEGRATION_NOT_AVAILABLE_ERROR);
    }

    runInAction(() => {
      this.connectLoading = true;
    });

    try {
      const created = await integrationsApi.create({ integration_type });

      if (created.url) {
        return created;
      }

      await this.loadIntegrations({ silent: true });
      return created;
    } finally {
      runInAction(() => {
        this.connectLoading = false;
      });
    }
  };

  disconnectIntegration = async (
    type: IntegrationType,
    id: number,
  ): Promise<void> => {
    const loadingKey = this.disconnectKey(type, id);

    runInAction(() => {
      this.disconnectLoadingKey = loadingKey;
    });

    try {
      await integrationsApi.delete(type, id);
      await this.loadIntegrations({ silent: true });
    } finally {
      runInAction(() => {
        if (this.disconnectLoadingKey === loadingKey) {
          this.disconnectLoadingKey = null;
        }
      });
    }
  };
}
