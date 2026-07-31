import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import { isInstagramOAuthSessionExpiredError } from "@/features/integrations/is-instagram-oauth-session-expired";
import {
  closeIntegrationAuthWindow,
  navigateIntegrationAuthUrl,
  openIntegrationAuthWindow,
} from "@/features/integrations/open-integration-auth";
import type {
  IntegrationItem,
  MonobankIntegrationPayload,
  NovaPoshtaIntegrationCreatePayload,
  TelegramQrLoginSession,
} from "@/features/integrations/model/integration.types";
import type { InstagramOAuthPage } from "@/features/integrations/model/instagram-oauth.types";
import { isIntegrationNotAvailableError } from "@/features/integrations/model/integrations-store";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { InstagramSetupStage } from "../instagram";
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
const INSTAGRAM_OAUTH_POLL_INTERVAL_MS = 2_500;
const TIKTOK_OAUTH_POLL_INTERVAL_MS = 2_000;
const TIKTOK_OAUTH_SESSION_STORAGE_KEY = "tiktok-oauth-session-id";

function readCreatedOAuthSessionId(created: IntegrationItem): string | null {
  const createdRecord = created as IntegrationItem & {
    session_id?: unknown;
  };
  const sessionIdCandidate =
    createdRecord.sessionId ?? createdRecord.session_id;

  return typeof sessionIdCandidate === "string" && sessionIdCandidate.trim()
    ? sessionIdCandidate.trim()
    : null;
}

function storeTikTokOAuthSessionId(sessionId: string): void {
  try {
    sessionStorage.setItem(TIKTOK_OAUTH_SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Ignore storage failures — popup polling still works via in-memory refs.
  }
}

function clearStoredTikTokOAuthSessionId(): void {
  try {
    sessionStorage.removeItem(TIKTOK_OAUTH_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

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

type InstagramSetupState = {
  open: boolean;
  stage: InstagramSetupStage;
  sessionId: string | null;
  pages: InstagramOAuthPage[];
  expiresAt: string | null;
  connecting: boolean;
  awaitingOauth: boolean;
  confirming: boolean;
  sessionExpired: boolean;
  errorMessage: string | null;
};

const initialInstagramSetupState: InstagramSetupState = {
  open: false,
  stage: "facebook_login",
  sessionId: null,
  pages: [],
  expiresAt: null,
  connecting: false,
  awaitingOauth: false,
  confirming: false,
  sessionExpired: false,
  errorMessage: null,
};

export function useSettingsIntegrationsController() {
  const store = useIntegrationsStore();
  const notification = useNotification();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<IntegrationFilter>("all");
  const [novaPoshtaWizardOpen, setNovaPoshtaWizardOpen] = useState(false);
  const [monobankFormOpen, setMonobankFormOpen] = useState(false);
  const [manualPaymentFormOpen, setManualPaymentFormOpen] = useState(false);
  const [instagramSetup, setInstagramSetup] = useState<InstagramSetupState>(
    initialInstagramSetupState,
  );
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
  const instagramAuthWindowRef = useRef<Window | null>(null);
  const instagramOauthPollRef = useRef<number | null>(null);
  const instagramOauthPollInFlightRef = useRef(false);
  const instagramOauthSessionIdRef = useRef<string | null>(null);
  const instagramOauthRunIdRef = useRef(0);
  const tiktokAuthWindowRef = useRef<Window | null>(null);
  const tiktokOauthPollRef = useRef<number | null>(null);
  const tiktokOauthPollInFlightRef = useRef(false);
  const tiktokOauthSessionIdRef = useRef<string | null>(null);
  const tiktokOauthRunIdRef = useRef(0);
  const tiktokReturnHandledRef = useRef(false);

  useEffect(() => {
    void store.loadIntegrations();
  }, [store]);

  useEffect(() => {
    if (location.pathname === pagesMap.settingsIntegrationsTiktok) {
      setSelectedFilter("tiktok");
    }
  }, [location.pathname]);

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

  const closeInstagramAuthPopup = useCallback(() => {
    closeIntegrationAuthWindow(instagramAuthWindowRef.current);
    instagramAuthWindowRef.current = null;
  }, []);

  const stopInstagramOauthPoll = useCallback(
    (options?: { closePopup?: boolean }) => {
      if (instagramOauthPollRef.current != null) {
        window.clearInterval(instagramOauthPollRef.current);
        instagramOauthPollRef.current = null;
      }

      instagramOauthPollInFlightRef.current = false;
      instagramOauthSessionIdRef.current = null;

      if (options?.closePopup) {
        closeInstagramAuthPopup();
      }
    },
    [closeInstagramAuthPopup],
  );

  const closeInstagramSetup = useCallback(() => {
    instagramOauthRunIdRef.current += 1;
    stopInstagramOauthPoll({ closePopup: true });
    setInstagramSetup(initialInstagramSetupState);
  }, [stopInstagramOauthPoll]);

  const pollInstagramOAuthSession = useCallback(
    async (sessionId: string, runId: number) => {
      if (
        instagramOauthPollInFlightRef.current ||
        instagramOauthRunIdRef.current !== runId ||
        instagramOauthSessionIdRef.current !== sessionId
      ) {
        return;
      }

      instagramOauthPollInFlightRef.current = true;

      try {
        const result = await store.getInstagramOAuthPages(sessionId);

        if (
          instagramOauthRunIdRef.current !== runId ||
          instagramOauthSessionIdRef.current !== sessionId
        ) {
          return;
        }

        if (result.status === "awaiting_facebook") {
          return;
        }

        if (result.status === "select_page") {
          stopInstagramOauthPoll({ closePopup: true });
          setInstagramSetup({
            open: true,
            stage: "select_page",
            sessionId: result.sessionId || sessionId,
            pages: result.pages,
            expiresAt: result.expiresAt ?? null,
            connecting: false,
            awaitingOauth: false,
            confirming: false,
            sessionExpired: false,
            errorMessage: null,
          });
          return;
        }

        if (result.status === "failed") {
          stopInstagramOauthPoll({ closePopup: true });
          setInstagramSetup({
            open: true,
            stage: "facebook_login",
            sessionId: null,
            pages: [],
            expiresAt: null,
            connecting: false,
            awaitingOauth: false,
            confirming: false,
            sessionExpired: false,
            errorMessage:
              result.error || t("integrations.instagramSetup.oauthFailed"),
          });
        }
      } catch (e) {
        if (
          instagramOauthRunIdRef.current !== runId ||
          instagramOauthSessionIdRef.current !== sessionId
        ) {
          return;
        }

        if (isInstagramOAuthSessionExpiredError(e)) {
          stopInstagramOauthPoll({ closePopup: true });
          setInstagramSetup({
            open: true,
            stage: "facebook_login",
            sessionId: null,
            pages: [],
            expiresAt: null,
            connecting: false,
            awaitingOauth: false,
            confirming: false,
            sessionExpired: true,
            errorMessage: t("integrations.instagramSetup.sessionExpired"),
          });
          return;
        }

        // Transient poll errors — keep waiting while popup/session may still succeed.
      } finally {
        if (instagramOauthSessionIdRef.current === sessionId) {
          instagramOauthPollInFlightRef.current = false;
        }
      }
    },
    [stopInstagramOauthPoll, store, t],
  );

  const startInstagramOauthPoll = useCallback(
    (sessionId: string, authWindow: Window | null) => {
      const runId = instagramOauthRunIdRef.current + 1;
      instagramOauthRunIdRef.current = runId;

      stopInstagramOauthPoll();
      instagramAuthWindowRef.current = authWindow;
      instagramOauthSessionIdRef.current = sessionId;

      void pollInstagramOAuthSession(sessionId, runId);

      instagramOauthPollRef.current = window.setInterval(() => {
        void pollInstagramOAuthSession(sessionId, runId);
      }, INSTAGRAM_OAUTH_POLL_INTERVAL_MS);
    },
    [pollInstagramOAuthSession, stopInstagramOauthPoll],
  );

  useEffect(() => {
    return () => {
      instagramOauthRunIdRef.current += 1;
      stopInstagramOauthPoll({ closePopup: true });
    };
  }, [stopInstagramOauthPoll]);

  const closeTikTokAuthPopup = useCallback(() => {
    closeIntegrationAuthWindow(tiktokAuthWindowRef.current);
    tiktokAuthWindowRef.current = null;
  }, []);

  const stopTikTokOauthPoll = useCallback(
    (options?: { closePopup?: boolean }) => {
      if (tiktokOauthPollRef.current != null) {
        window.clearInterval(tiktokOauthPollRef.current);
        tiktokOauthPollRef.current = null;
      }

      tiktokOauthPollInFlightRef.current = false;
      tiktokOauthSessionIdRef.current = null;

      if (options?.closePopup) {
        closeTikTokAuthPopup();
      }
    },
    [closeTikTokAuthPopup],
  );

  const pollTikTokOAuthSession = useCallback(
    async (sessionId: string, runId: number) => {
      if (
        tiktokOauthPollInFlightRef.current ||
        tiktokOauthRunIdRef.current !== runId ||
        tiktokOauthSessionIdRef.current !== sessionId
      ) {
        return;
      }

      tiktokOauthPollInFlightRef.current = true;

      try {
        const result = await store.getTikTokOAuthStatus(sessionId);

        if (
          tiktokOauthRunIdRef.current !== runId ||
          tiktokOauthSessionIdRef.current !== sessionId
        ) {
          return;
        }

        if (result.status === "awaiting_tiktok") {
          return;
        }

        if (result.status === "connected") {
          stopTikTokOauthPoll({ closePopup: true });
          clearStoredTikTokOAuthSessionId();
          await store.loadIntegrations({ silent: true, force: true });
          notification.success({ title: t("integrations.connectSuccess") });
          return;
        }

        if (result.status === "failed") {
          stopTikTokOauthPoll({ closePopup: true });
          clearStoredTikTokOAuthSessionId();
          notification.error({
            title:
              result.error ||
              t("integrations.tiktokOauth.oauthFailed"),
          });
        }
      } catch (e) {
        if (
          tiktokOauthRunIdRef.current !== runId ||
          tiktokOauthSessionIdRef.current !== sessionId
        ) {
          return;
        }

        if (isInstagramOAuthSessionExpiredError(e)) {
          stopTikTokOauthPoll({ closePopup: true });
          clearStoredTikTokOAuthSessionId();
          notification.error({
            title: t("integrations.tiktokOauth.sessionExpired"),
          });
          return;
        }

        // Transient poll errors — keep waiting while popup/session may still succeed.
      } finally {
        if (tiktokOauthSessionIdRef.current === sessionId) {
          tiktokOauthPollInFlightRef.current = false;
        }
      }
    },
    [notification, stopTikTokOauthPoll, store, t],
  );

  const startTikTokOauthPoll = useCallback(
    (sessionId: string, authWindow: Window | null) => {
      const runId = tiktokOauthRunIdRef.current + 1;
      tiktokOauthRunIdRef.current = runId;

      stopTikTokOauthPoll();
      tiktokAuthWindowRef.current = authWindow;
      tiktokOauthSessionIdRef.current = sessionId;
      storeTikTokOAuthSessionId(sessionId);

      void pollTikTokOAuthSession(sessionId, runId);

      tiktokOauthPollRef.current = window.setInterval(() => {
        void pollTikTokOAuthSession(sessionId, runId);
      }, TIKTOK_OAUTH_POLL_INTERVAL_MS);
    },
    [pollTikTokOAuthSession, stopTikTokOauthPoll],
  );

  useEffect(() => {
    return () => {
      tiktokOauthRunIdRef.current += 1;
      stopTikTokOauthPoll({ closePopup: true });
    };
  }, [stopTikTokOauthPoll]);

  const clearTikTokReturnQuery = useCallback(() => {
    if (!searchParams.has("status")) {
      if (location.pathname === pagesMap.settingsIntegrationsTiktok) {
        navigate(pagesMap.settingsIntegrations, { replace: true });
      }
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("status");

    if (location.pathname === pagesMap.settingsIntegrationsTiktok) {
      const query = nextParams.toString();
      navigate(
        query
          ? `${pagesMap.settingsIntegrations}?${query}`
          : pagesMap.settingsIntegrations,
        { replace: true },
      );
      return;
    }

    setSearchParams(nextParams, { replace: true });
  }, [location.pathname, navigate, searchParams, setSearchParams]);

  useEffect(() => {
    const status = searchParams.get("status");

    if (status !== "success" && status !== "error") {
      tiktokReturnHandledRef.current = false;
      return;
    }

    if (tiktokReturnHandledRef.current) {
      return;
    }

    tiktokReturnHandledRef.current = true;

    // Popup callback tab: opener keeps polling and owns toasts/list refresh.
    if (window.opener && !window.opener.closed) {
      clearStoredTikTokOAuthSessionId();
      window.close();
      return;
    }

    tiktokOauthRunIdRef.current += 1;
    stopTikTokOauthPoll({ closePopup: true });
    clearStoredTikTokOAuthSessionId();

    const finishReturn = async () => {
      if (status === "success") {
        try {
          await store.loadIntegrations({ silent: true, force: true });
          notification.success({ title: t("integrations.connectSuccess") });
        } catch (e) {
          notification.error({
            title: getApiErrorMessage(e, t("integrations.connectFailed")),
          });
        }
      } else {
        notification.error({
          title: t("integrations.tiktokOauth.oauthDenied"),
        });
      }

      clearTikTokReturnQuery();
    };

    void finishReturn();
  }, [
    clearTikTokReturnQuery,
    notification,
    searchParams,
    stopTikTokOauthPoll,
    store,
    t,
  ]);

  const connectTikTok = useCallback(async () => {
    tiktokOauthRunIdRef.current += 1;
    stopTikTokOauthPoll({ closePopup: true });
    clearStoredTikTokOAuthSessionId();
    setSelectedFilter("tiktok");

    const authWindow = openIntegrationAuthWindow({
      keepOpener: true,
      popup: true,
    });
    const popupAvailable = Boolean(authWindow && !authWindow.closed);

    try {
      const created = await store.connectIntegration("tiktok");
      const sessionId = readCreatedOAuthSessionId(created);

      if (!created.url || !sessionId) {
        closeIntegrationAuthWindow(authWindow);
        notification.error({
          title: t("integrations.tiktokOauth.oauthFailed"),
        });
        return;
      }

      storeTikTokOAuthSessionId(sessionId);

      if (popupAvailable) {
        navigateIntegrationAuthUrl(created.url, authWindow, { popup: true });
        startTikTokOauthPoll(sessionId, authWindow);
        return;
      }

      // Popup blocked — same-tab redirect; backend returns to SPA with ?status=.
      window.location.assign(created.url);
    } catch (e) {
      closeIntegrationAuthWindow(authWindow);
      clearStoredTikTokOAuthSessionId();
      notification.error({
        title: isIntegrationNotAvailableError(e)
          ? t("integrations.notAvailableYet")
          : getApiErrorMessage(e, t("integrations.connectFailed")),
      });
    }
  }, [notification, startTikTokOauthPoll, stopTikTokOauthPoll, store, t]);

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
    [closeTelegramPasswordModal, notification, store, t, telegramPasswordModal],
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

  const openInstagramSetup = useCallback(() => {
    instagramOauthRunIdRef.current += 1;
    stopInstagramOauthPoll({ closePopup: true });
    setInstagramSetup({
      ...initialInstagramSetupState,
      open: true,
      stage: "facebook_login",
    });
  }, [stopInstagramOauthPoll]);

  const startInstagramFacebookLogin = useCallback(async () => {
    instagramOauthRunIdRef.current += 1;
    stopInstagramOauthPoll({ closePopup: true });

    setInstagramSetup((current) => ({
      ...current,
      open: true,
      stage: "facebook_login",
      sessionId: null,
      pages: [],
      connecting: true,
      awaitingOauth: false,
      confirming: false,
      sessionExpired: false,
      errorMessage: null,
    }));

    const authWindow = openIntegrationAuthWindow({
      keepOpener: true,
      popup: true,
    });

    try {
      const created = await store.connectIntegration("instagram");
      const sessionId = readCreatedOAuthSessionId(created);

      if (created.url && sessionId) {
        navigateIntegrationAuthUrl(created.url, authWindow, { popup: true });
        setInstagramSetup((current) => ({
          ...current,
          sessionId,
          connecting: false,
          awaitingOauth: true,
          errorMessage: null,
        }));
        startInstagramOauthPoll(sessionId, authWindow);
        return;
      }

      closeIntegrationAuthWindow(authWindow);
      setInstagramSetup((current) => ({
        ...current,
        connecting: false,
        awaitingOauth: false,
        errorMessage: t("integrations.instagramSetup.oauthFailed"),
      }));
    } catch (e) {
      closeIntegrationAuthWindow(authWindow);
      setInstagramSetup((current) => ({
        ...current,
        connecting: false,
        awaitingOauth: false,
        errorMessage: isIntegrationNotAvailableError(e)
          ? t("integrations.notAvailableYet")
          : getApiErrorMessage(e, t("integrations.connectFailed")),
      }));
    }
  }, [startInstagramOauthPoll, stopInstagramOauthPoll, store, t]);

  const confirmInstagramPage = useCallback(
    async (pageId: string) => {
      const sessionId = instagramSetup.sessionId;

      if (!sessionId) {
        setInstagramSetup((current) => ({
          ...current,
          sessionExpired: true,
          errorMessage: t("integrations.instagramSetup.sessionExpired"),
        }));
        return;
      }

      setInstagramSetup((current) => ({
        ...current,
        confirming: true,
        errorMessage: null,
        sessionExpired: false,
      }));

      try {
        await store.confirmInstagramOAuth({ sessionId, pageId });
        stopInstagramOauthPoll({ closePopup: true });
        setInstagramSetup(initialInstagramSetupState);
        notification.success({ title: t("integrations.connectSuccess") });
      } catch (e) {
        if (isInstagramOAuthSessionExpiredError(e)) {
          setInstagramSetup((current) => ({
            ...current,
            confirming: false,
            sessionExpired: true,
            errorMessage: t("integrations.instagramSetup.sessionExpired"),
          }));
          return;
        }

        setInstagramSetup((current) => ({
          ...current,
          confirming: false,
          errorMessage: getApiErrorMessage(e, t("integrations.connectFailed")),
        }));
      }
    },
    [instagramSetup.sessionId, notification, stopInstagramOauthPoll, store, t],
  );

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

      if (type === "monobank") {
        setMonobankFormOpen(true);
        return;
      }

      if (type === "manualpayment") {
        setManualPaymentFormOpen(true);
        return;
      }

      if (type === "telegram") {
        await startTelegramQrLogin();
        return;
      }

      if (type === "instagram") {
        openInstagramSetup();
        return;
      }

      if (type === "tiktok") {
        await connectTikTok();
        return;
      }

      notification.error({ title: t("integrations.notAvailableYet") });
    },
    [connectTikTok, notification, openInstagramSetup, startTelegramQrLogin, t],
  );

  const closeNovaPoshtaWizard = useCallback(() => {
    setNovaPoshtaWizardOpen(false);
  }, []);

  const closeMonobankForm = useCallback(() => {
    setMonobankFormOpen(false);
  }, []);

  const closeManualPaymentForm = useCallback(() => {
    setManualPaymentFormOpen(false);
  }, []);

  const handleIntegrationUpdated = useCallback(() => {
    void store.loadIntegrations({ silent: true, force: true });
  }, [store]);

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

  const handleMonobankSubmit = useCallback(
    async (payload: MonobankIntegrationPayload) => {
      try {
        await store.connectMonobankIntegration(payload);
        setMonobankFormOpen(false);
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
    handleIntegrationUpdated,
    novaPoshtaWizardOpen,
    closeNovaPoshtaWizard,
    handleNovaPoshtaWizardSubmit,
    monobankFormOpen,
    closeMonobankForm,
    handleMonobankSubmit,
    manualPaymentFormOpen,
    closeManualPaymentForm,
    instagramSetup,
    closeInstagramSetup,
    startInstagramFacebookLogin,
    confirmInstagramPage,
    restartInstagramSetup: openInstagramSetup,
    telegramQrModal,
    closeTelegramQrModal,
    retryTelegramQrLogin: startTelegramQrLogin,
    telegramPasswordModal,
    closeTelegramPasswordModal,
    submitTelegramPassword,
  };
}
