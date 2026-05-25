import { useContext } from 'react';

import { CategoriesStoreContext } from './categories-store-context';
import type { CategoriesStore } from './categories-store';

export const useCategoriesStore = (): CategoriesStore => {
  const store = useContext(CategoriesStoreContext);

  if (!store) {
    throw new Error('useCategoriesStore must be used within CategoriesProvider');
  }

  return store;
};
