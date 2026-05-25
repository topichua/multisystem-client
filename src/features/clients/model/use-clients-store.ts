import { useContext } from 'react';

import { ClientsStoreContext } from './clients-store-context';
import type { ClientsStore } from './clients-store';

export const useClientsStore = (): ClientsStore => {
  const store = useContext(ClientsStoreContext);

  if (!store) {
    throw new Error('useClientsStore must be used within ClientsProvider');
  }

  return store;
};
