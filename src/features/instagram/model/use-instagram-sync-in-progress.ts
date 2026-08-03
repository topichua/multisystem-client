import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { instagramApi } from "@/features/instagram/api/instagram-api";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";

const SYNC_POLL_MS = 4_000;
/** Keep checking briefly after connect until sync shows up as active. */
const WAIT_FOR_SYNC_START_MS = 30_000;

/**
 * Tracks Instagram history sync for the conversations UI.
 * Polls `/synchronizations/active` only while sync is in progress (or briefly
 * waiting for it to start after connect). Stops as soon as sync is inactive.
 */
export function useInstagramSyncInProgress(): {
  instagramSyncInProgress: boolean;
  dismissInstagramSyncNotice: () => void;
} {
  const { t } = useTranslation();
  const notification = useNotification();
  const integrationsStore = useIntegrationsStore();
  const conversationsStore = useConversationsStore();
  const groupsStore = useConversationGroupsStore();
  const [instagramSyncInProgress, setInstagramSyncInProgress] = useState(false);
  const dismissedRef = useRef(false);

  const instagramIntegrationKey = integrationsStore.items
    .filter((item) => item.type === "instagram")
    .map((item) => item.id)
    .join(",");

  useEffect(() => {
    dismissedRef.current = false;

    let cancelled = false;
    let timeoutId: number | null = null;
    let sawActive = false;
    let stopPolling = false;
    const startedAt = Date.now();

    const clearTimer = () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const refreshConversationData = (silent = false) => {
      void conversationsStore.loadConversations(
        silent ? { silent: true } : undefined,
      );
      void groupsStore.loadGroups({ silent: true, includeDistribution: true });
    };

    const scheduleNext = (isActive: boolean) => {
      clearTimer();

      if (stopPolling || cancelled) {
        return;
      }

      if (isActive) {
        timeoutId = window.setTimeout(() => {
          void runCheck();
        }, SYNC_POLL_MS);
        return;
      }

      // Sync not active yet: wait briefly for it to start after connect.
      const waitingForStart =
        !sawActive &&
        Boolean(instagramIntegrationKey) &&
        Date.now() - startedAt < WAIT_FOR_SYNC_START_MS;

      if (!waitingForStart) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        void runCheck();
      }, SYNC_POLL_MS);
    };

    const runCheck = async () => {
      if (stopPolling || cancelled) {
        return;
      }

      let isActive: boolean;
      try {
        isActive = await instagramApi.getActiveSynchronizations();
      } catch {
        isActive = false;
      }

      if (cancelled || stopPolling) {
        return;
      }

      if (isActive) {
        sawActive = true;
        // Keep the list current while history is still importing.
        refreshConversationData(true);
      } else if (sawActive) {
        // Sync finished — refresh once, notify, then stop listening.
        refreshConversationData();
        notification.success({
          title: t("conversations.instagramSyncCompleted"),
        });
        stopPolling = true;
      }

      if (!dismissedRef.current) {
        setInstagramSyncInProgress(isActive);
      }

      scheduleNext(isActive);
    };

    void runCheck();

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [
    conversationsStore,
    groupsStore,
    instagramIntegrationKey,
    notification,
    t,
  ]);

  return {
    instagramSyncInProgress,
    dismissInstagramSyncNotice: () => {
      dismissedRef.current = true;
      setInstagramSyncInProgress(false);
    },
  };
}
