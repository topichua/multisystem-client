import { useState, type ReactNode } from 'react';

import { ClientsStoreContext } from './clients-store-context';
import { ClientsStore } from './clients-store';

type ClientsProviderProps = {
  children: ReactNode;
};

export const ClientsProvider = ({ children }: ClientsProviderProps) => {
  const [store] = useState(() => new ClientsStore());

  return <ClientsStoreContext.Provider value={store}>{children}</ClientsStoreContext.Provider>;
};
