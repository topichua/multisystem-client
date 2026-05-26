import { Navigate, Route, Routes } from "react-router";
import { HomePage } from "@/pages/home-page/home-page";
import { LoginPage } from "@/pages/login-page/login-page";
import { SettingsPage } from "@/pages/settings-page/settings-page";
import { SettingsGroupDetailView } from "@/pages/settings-page/settings-groups/settings-group-detail-view";
import { SettingsGroupsIndex } from "@/pages/settings-page/settings-groups/settings-groups-index";
import { SettingsGroupsLayout } from "@/pages/settings-page/settings-groups/settings-groups-layout";
import { SettingsSystemView } from "@/pages/settings-page/settings-system-view";
import { SettingsUserView } from "@/pages/settings-page/settings-user-view";
import { SettingsIntegrationsPage } from "@/pages/settings-page/settings-integrations/settings-integrations-page";
import { ProductsPage } from "@/pages/products-page/products-page";
import { ProductsCategoriesLayout } from "@/pages/products-page/products-categories/products-categories-layout";
import { ProductsCategoriesIndex } from "@/pages/products-page/products-categories/products-categories-index";
import { ProductCategoryDetailView } from "@/pages/products-page/products-categories/product-category-detail-view";
import { ProductAddPage } from "@/pages/products-page/products-list/product-add-page";
import { ProductsListPage } from "@/pages/products-page/products-list/products-list-page";
import { ClientsPage } from "@/pages/clients-page/clients-page";
import { ClientsListPage } from "@/pages/clients-page/clients-list/clients-list-page";
import { OrdersPage } from "@/pages/orders-page/orders-page";
import { OrderStatusDetailView } from "@/pages/orders-page/order-statuses/order-status-detail-view";
import { OrderStatusesIndex } from "@/pages/orders-page/order-statuses/order-statuses-index";
import { OrderStatusesLayout } from "@/pages/orders-page/order-statuses/order-statuses-layout";
import { OrdersListPage } from "@/pages/orders-page/orders-list/orders-list-page";
import { OrderDetailsPage } from "@/pages/orders-page/order-details/order-details-page";

import { pagesMap } from "./pages-map";
import { ProtectedRoute } from "./protected-route";
import { PublicOnlyRoute } from "./public-only-route";
import { ConversationsPage } from "@/pages/conversation/conversations-page";
import { EmptyConversation } from "@/pages/conversation/empty-conversation";
import { ConversationDetails } from "@/pages/conversation/conversation-details/conversation-details";

export const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={pagesMap.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={pagesMap.home} element={<HomePage />}>
          <Route
            index
            element={<Navigate to={pagesMap.conversations} replace />}
          />
          <Route path="conversations" element={<ConversationsPage />}>
            <Route index element={<EmptyConversation />} />
            <Route path=":conversationId" element={<ConversationDetails />} />
          </Route>
          <Route path="settings" element={<SettingsPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.settingsGroups} replace />}
            />
            <Route path="groups" element={<SettingsGroupsLayout />}>
              <Route index element={<SettingsGroupsIndex />} />
              <Route path=":groupId" element={<SettingsGroupDetailView />} />
            </Route>
            <Route path="user" element={<SettingsUserView />} />
            <Route path="system" element={<SettingsSystemView />} />
            <Route path="integrations" element={<SettingsIntegrationsPage />} />
          </Route>
          <Route path="products" element={<ProductsPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.productsList} replace />}
            />
            <Route path="list/add" element={<ProductAddPage />} />
            <Route
              path="list/product/:productId"
              element={<ProductAddPage />}
            />
            <Route path="list" element={<ProductsListPage />} />
            <Route path="categories" element={<ProductsCategoriesLayout />}>
              <Route index element={<ProductsCategoriesIndex />} />
              <Route
                path=":categoryId"
                element={<ProductCategoryDetailView />}
              />
            </Route>
          </Route>
          <Route path="orders" element={<OrdersPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.ordersList} replace />}
            />
            <Route path="list" element={<OrdersListPage />} />
            <Route path=":orderId" element={<OrderDetailsPage />} />
            <Route path="statuses" element={<OrderStatusesLayout />}>
              <Route index element={<OrderStatusesIndex />} />
              <Route path=":statusId" element={<OrderStatusDetailView />} />
            </Route>
          </Route>
          <Route path="clients" element={<ClientsPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.clientsWorkspace} replace />}
            />
            <Route path="clients" element={<ClientsListPage />} />
          </Route>
        </Route>
      </Route>

      <Route
        path={pagesMap.fallback}
        element={<Navigate to={pagesMap.conversations} replace />}
      />
    </Routes>
  );
};
