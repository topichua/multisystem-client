import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/model/auth-provider";
import { UserProvider } from "@/features/auth/model/user-provider";
import { CategoriesProvider } from "@/features/categories/model/categories-provider";
import { CharacteristicsProvider } from "@/features/characteristics/model/characteristics-provider";
import { ClientsProvider } from "@/features/clients/model/clients-provider";
import { ConversationGroupsProvider } from "@/features/conversation-groups/model/conversation-groups-provider";
import { MessageTemplatesProvider } from "@/features/message-templates/model/message-templates-provider";
import { ConversationsProvider } from "@/features/conversations/model/conversations-provider";
import { OrdersProvider } from "@/features/orders/model/orders-provider";
import { ProductsProvider } from "@/features/products/model/products-provider";
import { WorkspaceMembersProvider } from "@/features/workspace-members/model/workspace-members-provider";

export const FeatureProviders = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <UserProvider>
      <ConversationsProvider>
        <CategoriesProvider>
          <CharacteristicsProvider>
            <ClientsProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <ConversationGroupsProvider>
                    <MessageTemplatesProvider>
                      <WorkspaceMembersProvider>
                        {children}
                      </WorkspaceMembersProvider>
                    </MessageTemplatesProvider>
                  </ConversationGroupsProvider>
                </OrdersProvider>
              </ProductsProvider>
            </ClientsProvider>
          </CharacteristicsProvider>
        </CategoriesProvider>
      </ConversationsProvider>
    </UserProvider>
  </AuthProvider>
);
