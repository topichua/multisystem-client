import { useEffect } from 'react';

import { useAuth } from '@/features/auth/model/use-auth';
import { tokenStorage } from '@/features/auth/model/token-storage';
import { useUserStore } from '@/features/auth/model/use-user-store';
import { installMessageNotificationAudioUnlock } from '@/features/conversations/realtime/play-new-message-notification';

import type { ConversationStore } from './conversation-store';
import type { ConversationsSocketStore } from './conversations-socket-store';

type ConversationsRealtimeBootstrapProps = {
  conversationStore: ConversationStore;
  socketStore: ConversationsSocketStore;
};

export const ConversationsRealtimeBootstrap = ({
  conversationStore,
  socketStore,
}: ConversationsRealtimeBootstrapProps) => {
  const { isAuthenticated, logout } = useAuth();
  const { company } = useUserStore();

  useEffect(() => {
    conversationStore.setSelfInstagramAccountId(company?.instagramAccountId ?? null);
  }, [company?.instagramAccountId, conversationStore]);

  useEffect(() => {
    if (!isAuthenticated) {
      socketStore.disconnect();
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL;
    const jwt = tokenStorage.getAccessToken();

    if (!apiBaseUrl || !jwt) {
      return;
    }

    socketStore.connect(apiBaseUrl, jwt, { onAuthError: logout });

    return () => {
      socketStore.disconnect();
    };
  }, [isAuthenticated, logout, socketStore]);

  useEffect(() => {
    return socketStore.onUpdate((payload) => {
      conversationStore.applyRealtimeUpdate(payload);
    });
  }, [conversationStore, socketStore]);

  useEffect(() => installMessageNotificationAudioUnlock(), []);

  return null;
};
