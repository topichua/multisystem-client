import { useContext } from 'react';

import { ConversationsSocketStoreContext } from './conversations-socket-store-context';
import type { ConversationsSocketStore } from './conversations-socket-store';

export const useConversationsSocketStore = (): ConversationsSocketStore => {
  const store = useContext(ConversationsSocketStoreContext);

  if (!store) {
    throw new Error('useConversationsSocketStore must be used within ConversationsProvider');
  }

  return store;
};
