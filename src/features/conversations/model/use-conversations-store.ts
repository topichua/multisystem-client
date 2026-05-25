import { useContext } from 'react';

import { ConversationsStoreContext } from './conversation-store-context';
import type { ConversationStore } from './conversation-store';

export const useConversationsStore = (): ConversationStore => {
  const store = useContext(ConversationsStoreContext);

  if (!store) {
    throw new Error('useConversationsStore must be used within ConversationsProvider');
  }

  return store;
};
