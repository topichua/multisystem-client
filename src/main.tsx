import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-phone-number-input/style.css';
import './index.css';
import { BrowserRouter } from 'react-router';

import { App } from '@/app/app';
import { RootProviders } from '@/app/root-providers';
import '@/i18n';
import { AuthProvider } from '@/features/auth/model/auth-provider';
import { UserProvider } from '@/features/auth/model/user-provider';
import { CategoriesProvider } from '@/features/categories/model/categories-provider';
import { ClientsProvider } from '@/features/clients/model/clients-provider';
import { ConversationGroupsProvider } from '@/features/conversation-groups/model/conversation-groups-provider';
import { ConversationsProvider } from '@/features/conversations/model/conversations-provider';
import { OrdersProvider } from '@/features/orders/model/orders-provider';
import { ProductsProvider } from '@/features/products/model/products-provider';
import { initDayJs } from '@/utils/date-time';

initDayJs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProviders>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <ConversationsProvider>
              <CategoriesProvider>
                <ClientsProvider>
                  <ProductsProvider>
                    <OrdersProvider>
                      <ConversationGroupsProvider>
                        <App />
                      </ConversationGroupsProvider>
                    </OrdersProvider>
                  </ProductsProvider>
                </ClientsProvider>
              </CategoriesProvider>
            </ConversationsProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </RootProviders>
  </StrictMode>,
);
