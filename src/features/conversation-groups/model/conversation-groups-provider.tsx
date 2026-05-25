import { useState, type ReactNode } from 'react';

import { ConversationGroupsStoreContext } from './conversation-groups-store-context';
import { ConversationGroupsStore } from './conversation-groups-store';

type ConversationGroupsProviderProps = {
  children: ReactNode;
};

export const ConversationGroupsProvider = ({ children }: ConversationGroupsProviderProps) => {
  const [store] = useState(() => new ConversationGroupsStore());

  return (
    <ConversationGroupsStoreContext.Provider value={store}>
      {children}
    </ConversationGroupsStoreContext.Provider>
  );
};
