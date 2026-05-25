import { createContext } from 'react';

import type { AiToolsStore } from './ai-tools-store';

export const AiToolsStoreContext = createContext<AiToolsStore | null>(null);
