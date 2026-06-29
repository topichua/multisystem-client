import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  closeIntegrationAuthWindow,
  navigateIntegrationAuthUrl,
  openIntegrationAuthWindow,
} from "@/features/integrations/open-integration-auth";
import type {
  IntegrationItem,
  NovaPoshtaIntegrationCreatePayload,
  TelegramQrLoginSession,
} from "@/features/integrations/model/integration.types";
import { isIntegrationNotAvailableError } from "@/features/integrations/model/integrations-store";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  createEmptyIntegrationsByType,
  INTEGRATION_TYPES,
  isKnownIntegrationType,
  type IntegrationDefinition,
  type IntegrationFilter,
  type IntegrationType,
} from "../settings-integrations.definitions";
import type { TelegramQrLoginModalStatus } from "../telegram-qr-login-modal";

const TELEGRAM_QR_LOGIN_TIMEOUT_MS = 90_000;

type TelegramQrModalState = {
  open: boolean;
  status: TelegramQrLoginModalStatus;
  session: TelegramQrLoginSession | null;
};

type TelegramPasswordModalState = {
  open: boolean;
  integrationId: number | string | null;
  hint: string | null;
  submitting: boolean;
};

export function useSettingsIntegrationsController() {
  const store = useIntegrationsStore();
  const notification = useNotification();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<IntegrationFilter>("all");
  const [novaPoshtaWizardOpen, setNovaPoshtaWizardOpen] = useState(false);
  const [telegramQrModal, setTelegramQrModal] = useState<TelegramQrModalState>({
    open: false,
    status: "idle",
    session: null,
  });
  const [telegramPasswordModal, setTelegramPasswordModal] =
    useState<TelegramPasswordModalState>({
      open: false,
      integrationId: null,
      hint: null,
      submitting: false,
    });
  const telegramQrRunIdRef = useRef(0);
  const telegramQrAbortControllerRef = useRef<AbortController | null>(null);
  const telegramQrTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    void store.loadIntegrations();
  }, [store]);

  const clearTelegramQrTimeout = useCallback(() => {
    if (telegramQrTimeoutRef.current != null) {
      window.clearTimeout(telegramQrTimeoutRef.current);
      telegramQrTimeoutRef.current = null;
    }
  }, []);

  const abortTelegramQrRequest = useCallback(() => {
    clearTelegramQrTimeout();
    telegramQrAbortControllerRef.current?.abort();
    telegramQrAbortControllerRef.current = null;
  }, [clearTelegramQrTimeout]);

  const waitForTelegramQrConfirmation = useCallback(
    async (session: TelegramQrLoginSession, runId: number) => {
      const abortController = new AbortController();
      const startedAt = Date.now();
      telegramQrAbortControllerRef.current = abortController;

      const timeoutId = window.setTimeout(() => {
        if (telegramQrRunIdRef.current !== runId) {
          return;
        }

        abortController.abort();
        setTelegramQrModal((current) => {
          if (!current.open || current.session?.id !== session.id) {
            return current;
          }

          return { ...current, status: "expired" };
        });
      }, TELEGRAM_QR_LOGIN_TIMEOUT_MS);
      telegramQrTimeoutRef.current = timeoutId;

      try {
        const result = await store.confirmTelegramQrLogin(session.id, {
          signal: abortController.signal,
        });

        if (telegramQrRunIdRef.current !== runId) {
          return;
        }

        if (result.status === "pending_password") {
          clearTelegramQrTimeout();
          setTelegramQrModal({ open: false, status: "idle", session: null });
          setTelegramPasswordModal({
            open: true,
            integrationId: result.id,
            hint: result.nextStep ?? null,
            submitting: false,
          });
          return;
        }

        if (result.status === "active") {
          setTelegramQrModal({ open: false, status: "idle", session: null });
          notification.success({ title: t("integrations.connectSuccess") });
          return;
        }

        setTelegramQrModal((current) => ({ ...current, status: "error" }));
        notification.error({ title: t("integrations.connectFailed") });
      } catch (e) {
        if (telegramQrRunIdRef.current !== runId) {
          return;
        }

        if (
          abortController.signal.aborted ||
          Date.now() - startedAt >= TELEGRAM_QR_LOGIN_TIMEOUT_MS
        ) {
          setTelegramQrModal((current) => {
            if (!current.open || current.session?.id !== session.id) {
              return current;
            }

            return { ...current, status: "expired" };
          });
          return;
        }

        setTelegramQrModal((current) => ({ ...current, status: "error" }));
        notification.error({
          title: getApiErrorMessage(e, t("integrations.connectFailed")),
        });
      } finally {
        if (telegramQrAbortControllerRef.current === abortController) {
          telegramQrAbortControllerRef.current = null;
        }
        if (telegramQrTimeoutRef.current === timeoutId) {
          window.clearTimeout(timeoutId);
          telegramQrTimeoutRef.current = null;
        }
      }
    },
    [clearTelegramQrTimeout, notification, store, t],
  );

  const closeTelegramPasswordModal = useCallback(() => {
    setTelegramPasswordModal({
      open: false,
      integrationId: null,
      hint: null,
      submitting: false,
    });
  }, []);

  const submitTelegramPassword = useCallback(
    async (password: string) => {
      const { integrationId } = telegramPasswordModal;

      if (integrationId == null) {
        return;
      }

      setTelegramPasswordModal((current) => ({
        ...current,
        submitting: true,
      }));

      try {
        const result = await store.confirmTelegramPassword(
          integrationId,
          password,
        );

        if (result.status === "active") {
          closeTelegramPasswordModal();
          notification.success({ title: t("integrations.connectSuccess") });
          return;
        }

        notification.error({ title: t("integrations.connectFailed") });
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(
            e,
            t("integrations.telegramPassword.submitFailed"),
          ),
        });
      } finally {
        setTelegramPasswordModal((current) => ({
          ...current,
          submitting: false,
        }));
      }
    },
    [
      closeTelegramPasswordModal,
      notification,
      store,
      t,
      telegramPasswordModal,
    ],
  );

  const startTelegramQrLogin = useCallback(async () => {
    const runId = telegramQrRunIdRef.current + 1;
    telegramQrRunIdRef.current = runId;
    abortTelegramQrRequest();

    const abortController = new AbortController();
    telegramQrAbortControllerRef.current = abortController;
    setTelegramQrModal({ open: true, status: "loading", session: null });

    try {
      const session = await store.startTelegramQrLogin({
        signal: abortController.signal,
      });

      if (telegramQrRunIdRef.current !== runId) {
        return;
      }

      if (!session.qrImageUrl) {
        setTelegramQrModal({ open: true, status: "error", session: null });
        notification.error({ title: t("integrations.connectFailed") });
        return;
      }

      setTelegramQrModal({ open: true, status: "waiting", session });
      void waitForTelegramQrConfirmation(session, runId);
    } catch (e) {
      if (
        telegramQrRunIdRef.current !== runId ||
        abortController.signal.aborted
      ) {
        return;
      }

      setTelegramQrModal({ open: true, status: "error", session: null });
      notification.error({
        title: getApiErrorMessage(e, t("integrations.connectFailed")),
      });
    } finally {
      if (telegramQrAbortControllerRef.current === abortController) {
        telegramQrAbortControllerRef.current = null;
      }
    }
  }, [
    abortTelegramQrRequest,
    notification,
    store,
    t,
    waitForTelegramQrConfirmation,
  ]);

  const closeTelegramQrModal = useCallback(() => {
    telegramQrRunIdRef.current += 1;
    abortTelegramQrRequest();
    setTelegramQrModal({ open: false, status: "idle", session: null });
  }, [abortTelegramQrRequest]);

  useEffect(() => {
    return () => {
      telegramQrRunIdRef.current += 1;
      abortTelegramQrRequest();
    };
  }, [abortTelegramQrRequest]);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const integrationsByType = useMemo(() => {
    return store.items.reduce<Record<IntegrationType, IntegrationItem[]>>(
      (acc, integration) => {
        if (isKnownIntegrationType(integration.type)) {
          acc[integration.type].push(integration);
        }

        return acc;
      },
      createEmptyIntegrationsByType(),
    );
  }, [store.items]);

  const menuIntegrationTypes = useMemo(() => {
    if (!normalizedQuery) {
      return INTEGRATION_TYPES;
    }

    return INTEGRATION_TYPES.filter((item) => {
      const label = t(item.labelKey);
      const typeMatches = label.toLowerCase().includes(normalizedQuery);
      const integrationMatches = integrationsByType[item.type].some(
        (integration) => {
          const haystack =
            `${integration.type} ${integration.name}`.toLowerCase();

          return haystack.includes(normalizedQuery);
        },
      );

      return typeMatches || integrationMatches;
    });
  }, [integrationsByType, normalizedQuery, t]);

  const visibleIntegrationTypes = useMemo(() => {
    if (selectedFilter === "all") {
      return menuIntegrationTypes;
    }

    return menuIntegrationTypes.filter((item) => item.type === selectedFilter);
  }, [menuIntegrationTypes, selectedFilter]);

  const getVisibleIntegrations = useCallback(
    (item: IntegrationDefinition) => {
      const integrations = integrationsByType[item.type];
      const label = t(item.labelKey);

      if (!normalizedQuery || label.toLowerCase().includes(normalizedQuery)) {
        return integrations;
      }

      return integrations.filter((integration) => {
        const haystack =
          `${integration.type} ${integration.name}`.toLowerCase();

        return haystack.includes(normalizedQuery);
      });
    },
    [integrationsByType, normalizedQuery, t],
  );

  const handleDisconnect = useCallback(
    (integration: IntegrationItem) => {
      Modal.confirm({
        title: t("integrations.disconnectConfirmTitle"),
        content: t("integrations.disconnectConfirmContent", {
          name: integration.name,
        }),
        okText: t("integrations.disconnectConfirmOk"),
        okType: "danger",
        cancelText: t("integrations.disconnectConfirmCancel"),
        onOk: async () => {
          try {
            await store.disconnectIntegration(integration.type, integration.id);
            notification.success({
              title: t("integrations.disconnectSuccess"),
            });
          } catch (e) {
            notification.error({
              title: getApiErrorMessage(e, t("integrations.disconnectFailed")),
            });
            return Promise.reject();
          }
        },
      });
    },
    [notification, store, t],
  );

  const handleConnectType = useCallback(
    async (type: IntegrationType) => {
      if (type === "novaposhta") {
        setNovaPoshtaWizardOpen(true);
        return;
      }

      if (type === "telegram") {
        await startTelegramQrLogin();
        return;
      }

      const authWindow = openIntegrationAuthWindow();

      try {
        const created = await store.connectIntegration(type);

        if (created.url) {
          navigateIntegrationAuthUrl(created.url, authWindow);
          return;
        }

        closeIntegrationAuthWindow(authWindow);
        notification.success({ title: t("integrations.connectSuccess") });
      } catch (e) {
        closeIntegrationAuthWindow(authWindow);
        notification.error({
          title: isIntegrationNotAvailableError(e)
            ? t("integrations.notAvailableYet")
            : getApiErrorMessage(e, t("integrations.connectFailed")),
        });
      }
    },
    [notification, startTelegramQrLogin, store, t],
  );

  const closeNovaPoshtaWizard = useCallback(() => {
    setNovaPoshtaWizardOpen(false);
  }, []);

  const handleNovaPoshtaWizardSubmit = useCallback(
    async (payload: NovaPoshtaIntegrationCreatePayload) => {
      try {
        await store.createNovaPoshtaIntegration(payload);
        setNovaPoshtaWizardOpen(false);
        notification.success({ title: t("integrations.connectSuccess") });
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("integrations.connectFailed")),
        });
      }
    },
    [notification, store, t],
  );

  return {
    store,
    query,
    selectedFilter,
    integrationsByType,
    menuIntegrationTypes,
    visibleIntegrationTypes,
    setQuery,
    setSelectedFilter,
    getVisibleIntegrations,
    handleDisconnect,
    handleConnectType,
    novaPoshtaWizardOpen,
    closeNovaPoshtaWizard,
    handleNovaPoshtaWizardSubmit,
    telegramQrModal,
    closeTelegramQrModal,
    retryTelegramQrLogin: startTelegramQrLogin,
    telegramPasswordModal,
    closeTelegramPasswordModal,
    submitTelegramPassword,
  };
}
