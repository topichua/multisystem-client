import { useContext } from 'react';

import { AiToolsStoreContext } from './ai-tools-store-context';
import type { AiToolsStore } from './ai-tools-store';

export const useAiToolsStore = (): AiToolsStore => {
  const store = useContext(AiToolsStoreContext);

  if (!store) {
    throw new Error('useAiToolsStore must be used within AiToolsProvider');
  }

  return store;
};
