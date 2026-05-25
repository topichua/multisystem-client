import { createContext } from 'react';

import type { OrdersStore } from './orders-store';

export const OrdersStoreContext = createContext<OrdersStore | null>(null);
