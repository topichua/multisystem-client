import { useCallback, useEffect, useRef, useState } from "react";

import { conversationsApi } from "@/features/conversations/api/conversations-api";
import type { ConversationEvent } from "@/features/conversations/model/types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

type UseConversationEventsResult = {
  events: ConversationEvent[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useConversationEvents(
  conversationId: string | undefined,
  enabled: boolean,
): UseConversationEventsResult {
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const { items } = await conversationsApi.getEvents(conversationId);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setEvents(items);
    } catch (loadError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setEvents([]);
      setError(unknownErrorMessage(loadError));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void reload();
      }
    });

    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [enabled, reload]);

  return {
    events,
    loading,
    error,
    reload,
  };
}
