import { createContext } from 'react';

import type { ConversationStore } from './conversation-store';

export const ConversationsStoreContext = createContext<ConversationStore | null>(null);
