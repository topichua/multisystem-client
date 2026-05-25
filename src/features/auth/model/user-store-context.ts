import { createContext } from 'react';

import type { UserStore } from './user-store';

export const UserStoreContext = createContext<UserStore | null>(null);
