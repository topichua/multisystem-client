import { makeAutoObservable, runInAction } from "mobx";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import { throwLoadError } from "@/utils/throw-load-error";

import type {
  IntegrationItem,
  IntegrationType,
  NovaPoshtaIntegrationCreatePayload,
  TelegramQrLoginSession,
} from "./integration.types";

const INTEGRATION_NOT_AVAILABLE_ERROR = "INTEGRATION_NOT_AVAILABLE";

export const isIntegrationNotAvailableError = (error: unknown): boolean =>
  error instanceof Error && error.message === INTEGRATION_NOT_AVAILABLE_ERROR;

const CONNECTABLE_INTEGRATION_TYPES = [
  "instagram",
  "telegram",
] as const satisfies readonly IntegrationType[];

type ConnectableIntegrationType =
  (typeof CONNECTABLE_INTEGRATION_TYPES)[number];

type IntegrationRequestOptions = {
  signal?: AbortSignal;
};

export const isConnectableIntegrationType = (
  type: string,
): type is ConnectableIntegrationType =>
  (CONNECTABLE_INTEGRATION_TYPES as readonly string[]).includes(type);

export class IntegrationsStore {
  items: IntegrationItem[] = [];

  listLoading = false;

  connectLoadingType: IntegrationType | null = null;
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

  isConnecting(type: IntegrationType): boolean {
    return this.connectLoadingType === type;
  }

  loadIntegrations = async (options?: { silent?: boolean }): Promise<void> => {
    const silent = options?.silent === true;

    if (!silent) {
      runInAction(() => {
        this.listLoading = true;
      });
    }

    try {
      const data = await integrationsApi.list();
      runInAction(() => {
        this.items = Array.isArray(data.items) ? data.items : [];
      });
    } catch (e) {
      runInAction(() => {
        this.items = [];
      });
      throwLoadError("Failed to load integrations", e);
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
      this.connectLoadingType = integration_type;
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
        if (this.connectLoadingType === integration_type) {
          this.connectLoadingType = null;
        }
      });
    }
  };

  startTelegramQrLogin = async (
    options?: IntegrationRequestOptions,
  ): Promise<TelegramQrLoginSession> => {
    runInAction(() => {
      this.connectLoadingType = "telegram";
    });

    try {
      return await integrationsApi.startTelegramQrLogin(options);
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === "telegram") {
          this.connectLoadingType = null;
        }
      });
    }
  };

  createNovaPoshtaIntegration = async (
    payload: NovaPoshtaIntegrationCreatePayload,
  ): Promise<IntegrationItem> => {
    runInAction(() => {
      this.connectLoadingType = "novaposhta";
    });

    try {
      const created =
        await integrationsApi.createNovaPoshtaIntegration(payload);
      await this.loadIntegrations({ silent: true });

      return created;
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === "novaposhta") {
          this.connectLoadingType = null;
        }
      });
    }
  };

  confirmTelegramQrLogin = async (
    id: TelegramQrLoginSession["id"],
    options?: IntegrationRequestOptions,
  ) => {
    const result = await integrationsApi.confirmTelegramQrLogin(id, options);

    if (result.status === "active") {
      await this.loadIntegrations({ silent: true });
    }

    return result;
  };

  confirmTelegramPassword = async (
    id: TelegramQrLoginSession["id"],
    password: string,
    options?: IntegrationRequestOptions,
  ) => {
    const result = await integrationsApi.confirmTelegramPassword(
      id,
      password,
      options,
    );

    if (result.status === "active") {
      await this.loadIntegrations({ silent: true });
    }

    return result;
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
