import { createContext } from 'react';

import type { ConversationGroupsStore } from './conversation-groups-store';

export const ConversationGroupsStoreContext = createContext<ConversationGroupsStore | null>(null);
