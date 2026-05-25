import { useState, type ReactNode } from 'react';

import { ProductsStore } from './products-store';
import { ProductsStoreContext } from './products-store-context';

type ProductsProviderProps = {
  children: ReactNode;
};

export const ProductsProvider = ({ children }: ProductsProviderProps) => {
  const [store] = useState(() => new ProductsStore());

  return <ProductsStoreContext.Provider value={store}>{children}</ProductsStoreContext.Provider>;
};
