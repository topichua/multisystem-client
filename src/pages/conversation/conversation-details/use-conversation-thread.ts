import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { useConversationsSocketStore } from "@/features/conversations/model/use-conversations-socket-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import {
  chronologicalConversationMessages,
  EMPTY_MESSAGES,
  findLastOwnMessageIndex,
  newestMessageScrollAnchor,
} from "./conversation-thread";

export const useConversationThread = (
  conversationId: string | undefined,
  selfInstagramId: string | number | null,
) => {
  const {
    loadConversationMessages,
    loadOlderConversationMessages,
    messagesByConversationId,
    messagesError,
    messagesLoadingConversationId,
    messagesLoadingMoreConversationId,
    messagesPagingByConversationId,
  } = useConversationsStore();

  const socketStore = useConversationsSocketStore();

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollRestoreRef = useRef<{
    prevHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const messages = conversationId
    ? (messagesByConversationId[conversationId] ?? EMPTY_MESSAGES)
    : EMPTY_MESSAGES;

  const chronologicalMessages = useMemo(
    () => chronologicalConversationMessages(messages),
    [messages],
  );

  const lastOwnMessageIndex = useMemo(
    () => findLastOwnMessageIndex(chronologicalMessages, selfInstagramId),
    [chronologicalMessages, selfInstagramId],
  );

  const scrollToBottomAnchor = useMemo(
    () => newestMessageScrollAnchor(messages),
    [messages],
  );

  const loadingMessages = Boolean(
    conversationId && messagesLoadingConversationId === conversationId,
  );

  const loadingOlderMessages = Boolean(
    conversationId && messagesLoadingMoreConversationId === conversationId,
  );

  const messagePaging = conversationId
    ? messagesPagingByConversationId[conversationId]
    : undefined;

  useEffect(() => {
    pendingScrollRestoreRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    void loadConversationMessages(conversationId);
  }, [conversationId, loadConversationMessages]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const numericId = Number(conversationId);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return;
    }

    socketStore.subscribe(numericId);

    return () => {
      socketStore.unsubscribe(numericId);
    };
  }, [conversationId, socketStore]);

  useLayoutEffect(() => {
    if (loadingMessages) {
      return;
    }

    const el = messagesScrollRef.current;

    if (!el) {
      return;
    }

    el.scrollTop = el.scrollHeight;
  }, [conversationId, loadingMessages, scrollToBottomAnchor]);

  useLayoutEffect(() => {
    if (loadingOlderMessages || conversationId == null) {
      return;
    }

    const pending = pendingScrollRestoreRef.current;
    const el = messagesScrollRef.current;

    if (pending == null || el == null) {
      return;
    }

    const delta = el.scrollHeight - pending.prevHeight;
    el.scrollTop = pending.prevScrollTop + delta;
    pendingScrollRestoreRef.current = null;
  }, [conversationId, loadingOlderMessages, messages.length]);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current;

    if (el == null || conversationId == null) {
      return;
    }

    if (
      messagesLoadingConversationId === conversationId ||
      loadingOlderMessages
    ) {
      return;
    }

    if (!messagePaging?.has_next) {
      return;
    }

    if (el.scrollTop > 80) {
      return;
    }

    pendingScrollRestoreRef.current = {
      prevHeight: el.scrollHeight,
      prevScrollTop: el.scrollTop,
    };

    void loadOlderConversationMessages(conversationId);
  }, [
    conversationId,
    loadOlderConversationMessages,
    loadingOlderMessages,
    messagePaging?.has_next,
    messagesLoadingConversationId,
  ]);

  return {
    messagesScrollRef,
    chronologicalMessages,
    lastOwnMessageIndex,
    loadingMessages,
    loadingOlderMessages,
    messagesError,
    messagesLength: messages.length,
    handleMessagesScroll,
  };
};
