import { makeAutoObservable, runInAction } from "mobx";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import { throwLoadError } from "@/utils/throw-load-error";

import type {
  IntegrationItem,
  IntegrationType,
  ManualPaymentMethod,
  ManualPaymentMethodPayload,
  MonobankIntegrationPayload,
  NovaPoshtaIntegrationCreatePayload,
  PaymentIntegration,
  TelegramQrLoginSession,
} from "./integration.types";
import type {
  InstagramOAuthConfirmPayload,
  InstagramOAuthPagesResponse,
} from "./instagram-oauth.types";

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

const paymentIntegrationToIntegrationItem = (
  integration: PaymentIntegration,
): IntegrationItem => ({
  type: integration.provider,
  id: integration.id,
  name: integration.displayName,
  connectedAt: integration.createdAt,
  paymentProvider: integration.provider,
  displayName: integration.displayName,
  status: integration.status,
  isDefault: integration.isDefault,
  credentialsMasked: integration.credentialsMasked,
  lastConnectionCheckAt: integration.lastConnectionCheckAt,
  lastError: integration.lastError,
  updatedAt: integration.updatedAt,
});

const manualPaymentMethodToIntegrationItem = (
  method: ManualPaymentMethod,
): IntegrationItem => ({
  type: "manualpayment",
  id: method.id,
  name: method.name,
  connectedAt: method.createdAt,
  manualPaymentMethodType: method.type,
  manualPaymentValue: method.value,
  manualPaymentDisplayValue: method.displayValue,
  updatedAt: method.updatedAt,
});

export const isConnectableIntegrationType = (
  type: string,
): type is ConnectableIntegrationType =>
  (CONNECTABLE_INTEGRATION_TYPES as readonly string[]).includes(type);

export class IntegrationsStore {
  items: IntegrationItem[] = [];

  listLoading = false;

  connectLoadingType: IntegrationType | null = null;
  disconnectLoadingKey: string | null = null;
  integrationsLoadPromise: Promise<void> | null = null;

  constructor() {
    makeAutoObservable(this, { integrationsLoadPromise: false });
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

  loadIntegrations = async (options?: {
    silent?: boolean;
    force?: boolean;
  }): Promise<void> => {
    if (this.items.length > 0 && options?.force !== true) {
      return;
    }

    if (this.integrationsLoadPromise) {
      return this.integrationsLoadPromise;
    }

    const silent = options?.silent === true;

    const loadPromise = (async () => {
      if (!silent) {
        runInAction(() => {
          this.listLoading = true;
        });
      }

      try {
        const [integrationsResult, paymentResult, manualPaymentResult] =
          await Promise.allSettled([
            integrationsApi.list(),
            integrationsApi.listPaymentIntegrations(),
            integrationsApi.listManualPaymentMethods(),
          ]);

        if (integrationsResult.status === "rejected") {
          runInAction(() => {
            this.items = [];
          });
          throwLoadError(
            "Failed to load integrations",
            integrationsResult.reason,
          );
        }

        const integrationItems = Array.isArray(integrationsResult.value.items)
          ? integrationsResult.value.items.filter(
              (item) =>
                item.type !== "monobank" && item.type !== "manualpayment",
            )
          : [];
        const paymentItems =
          paymentResult.status === "fulfilled" &&
          Array.isArray(paymentResult.value.integrations)
            ? paymentResult.value.integrations.map(
                paymentIntegrationToIntegrationItem,
              )
            : [];
        const manualPaymentItems =
          manualPaymentResult.status === "fulfilled" &&
          Array.isArray(manualPaymentResult.value.items)
            ? manualPaymentResult.value.items.map(
                manualPaymentMethodToIntegrationItem,
              )
            : [];

        runInAction(() => {
          this.items = [
            ...integrationItems,
            ...paymentItems,
            ...manualPaymentItems,
          ];
        });
      } catch (e) {
        runInAction(() => {
          this.items = [];
        });
        throw e;
      } finally {
        if (!silent) {
          runInAction(() => {
            this.listLoading = false;
          });
        }
      }
    })();

    this.integrationsLoadPromise = loadPromise;

    try {
      await loadPromise;
    } finally {
      if (this.integrationsLoadPromise === loadPromise) {
        this.integrationsLoadPromise = null;
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

      // Instagram OAuth finishes only after page confirm — do not reload as connected.
      if (created.url || integration_type === "instagram") {
        return created;
      }

      await this.loadIntegrations({ silent: true, force: true });
      return created;
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === integration_type) {
          this.connectLoadingType = null;
        }
      });
    }
  };

  getInstagramOAuthPages = async (
    sessionId: string,
    options?: IntegrationRequestOptions,
  ): Promise<InstagramOAuthPagesResponse> => {
    return integrationsApi.getInstagramOAuthPages(sessionId, options);
  };

  confirmInstagramOAuth = async (
    payload: InstagramOAuthConfirmPayload,
    options?: IntegrationRequestOptions,
  ) => {
    runInAction(() => {
      this.connectLoadingType = "instagram";
    });

    try {
      const result = await integrationsApi.confirmInstagramOAuth(
        payload,
        options,
      );
      await this.loadIntegrations({ silent: true, force: true });
      return result;
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === "instagram") {
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
      await this.loadIntegrations({ silent: true, force: true });

      return created;
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === "novaposhta") {
          this.connectLoadingType = null;
        }
      });
    }
  };

  connectMonobankIntegration = async (
    payload: MonobankIntegrationPayload,
  ): Promise<PaymentIntegration> => {
    runInAction(() => {
      this.connectLoadingType = "monobank";
    });

    try {
      const created = await integrationsApi.connectMonobankIntegration(payload);
      await this.loadIntegrations({ silent: true, force: true });

      return created;
    } finally {
      runInAction(() => {
        if (this.connectLoadingType === "monobank") {
          this.connectLoadingType = null;
        }
      });
    }
  };

  updateMonobankIntegration = async (
    integrationId: PaymentIntegration["id"],
    payload: MonobankIntegrationPayload,
  ): Promise<PaymentIntegration> => {
    const updated = await integrationsApi.updateMonobankIntegration(
      integrationId,
      payload,
    );
    await this.loadIntegrations({ silent: true, force: true });

    return updated;
  };

  createManualPaymentMethod = async (
    payload: ManualPaymentMethodPayload,
  ): Promise<ManualPaymentMethod> => {
    const created = await integrationsApi.createManualPaymentMethod(payload);
    await this.loadIntegrations({ silent: true, force: true });

    return created;
  };

  updateManualPaymentMethod = async (
    id: ManualPaymentMethod["id"],
    payload: ManualPaymentMethodPayload,
  ): Promise<ManualPaymentMethod> => {
    const updated = await integrationsApi.updateManualPaymentMethod(
      id,
      payload,
    );
    await this.loadIntegrations({ silent: true, force: true });

    return updated;
  };

  deleteManualPaymentMethod = async (
    id: ManualPaymentMethod["id"],
  ): Promise<void> => {
    await integrationsApi.deleteManualPaymentMethod(id);
    await this.loadIntegrations({ silent: true, force: true });
  };

  confirmTelegramQrLogin = async (
    id: TelegramQrLoginSession["id"],
    options?: IntegrationRequestOptions,
  ) => {
    const result = await integrationsApi.confirmTelegramQrLogin(id, options);

    if (result.status === "active") {
      await this.loadIntegrations({ silent: true, force: true });
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
      await this.loadIntegrations({ silent: true, force: true });
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
      await this.loadIntegrations({ silent: true, force: true });
    } finally {
      runInAction(() => {
        if (this.disconnectLoadingKey === loadingKey) {
          this.disconnectLoadingKey = null;
        }
      });
    }
  };
}
