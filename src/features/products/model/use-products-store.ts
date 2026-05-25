import { useContext } from 'react';

import { ProductsStoreContext } from './products-store-context';
import type { ProductsStore } from './products-store';

export const useProductsStore = (): ProductsStore => {
  const store = useContext(ProductsStoreContext);

  if (!store) {
    throw new Error('useProductsStore must be used within ProductsProvider');
  }

  return store;
};
