import { useEffect, useState, type ReactNode } from 'react';

import { ConversationsSocketStoreContext } from './conversations-socket-store-context';
import { ConversationsStoreContext } from './conversation-store-context';
import { ConversationStore } from './conversation-store';
import { ConversationsSocketStore } from './conversations-socket-store';
import { ConversationsRealtimeBootstrap } from './conversations-realtime-bootstrap';

type ConversationsProviderProps = {
  children: ReactNode;
};

export const ConversationsProvider = ({ children }: ConversationsProviderProps) => {
  const [store, setStore] = useState(() => new ConversationStore());
  const [socketStore, setSocketStore] = useState(() => new ConversationsSocketStore());

  useEffect(() => {
    if (!import.meta.hot) {
      return;
    }

    import.meta.hot.accept('./conversation-store.ts', () => {
      setStore(new ConversationStore());
    });

    import.meta.hot.accept('./conversations-socket-store.ts', () => {
      setSocketStore(new ConversationsSocketStore());
    });
  }, []);

  return (
    <ConversationsSocketStoreContext.Provider value={socketStore}>
      <ConversationsStoreContext.Provider value={store}>
        <ConversationsRealtimeBootstrap conversationStore={store} socketStore={socketStore} />
        {children}
      </ConversationsStoreContext.Provider>
    </ConversationsSocketStoreContext.Provider>
  );
};
