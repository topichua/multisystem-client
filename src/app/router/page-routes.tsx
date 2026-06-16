import { Navigate, Route, Routes } from "react-router";
import { HomePage } from "@/pages/home-page/home-page";
import { QuickActionsPage } from "@/pages/home-page/quick-actions/quick-actions-page";
import { LoginPage } from "@/pages/login-page/login-page";
import { SettingsPage } from "@/pages/settings-page/settings-page";
import { SettingsGroupDetailView } from "@/pages/settings-page/settings-groups/settings-group-detail-view";
import { SettingsGroupsIndex } from "@/pages/settings-page/settings-groups/settings-groups-index";
import { SettingsGroupsLayout } from "@/pages/settings-page/settings-groups/settings-groups-layout";
import { SettingsSystemView } from "@/pages/settings-page/settings-system-view";
import { SettingsUserView } from "@/pages/settings-page/settings-user-view";
import { SettingsIntegrationsPage } from "@/pages/settings-page/settings-integrations/settings-integrations-page";
import { SettingsTemplateDetailView } from "@/pages/settings-page/settings-templates/settings-template-detail-view";
import { SettingsTemplatesIndex } from "@/pages/settings-page/settings-templates/settings-templates-index";
import { SettingsTemplatesLayout } from "@/pages/settings-page/settings-templates/settings-templates-layout";
import { ProductsPage } from "@/pages/products-page/products-page";
import { ProductsCategoriesLayout } from "@/pages/products-page/products-categories/products-categories-layout";
import { ProductsCategoriesIndex } from "@/pages/products-page/products-categories/products-categories-index";
import { ProductCategoryDetailView } from "@/pages/products-page/products-categories/product-category-detail-view";
import { ProductsCharacteristicsLayout } from "@/pages/products-page/products-characteristics/products-characteristics-layout";
import { ProductsCharacteristicsIndex } from "@/pages/products-page/products-characteristics/products-characteristics-index";
import { ProductCharacteristicDetailView } from "@/pages/products-page/products-characteristics/product-characteristic-detail-view";
import { ProductAddPage } from "@/pages/products-page/products-list/pages/product-add-page";
import { ProductsListPage } from "@/pages/products-page/products-list/list/products-list-page";
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
import { AnalyticsPage } from "@/pages/analytics-page/analytics-page";
import { ConversationsPage } from "@/pages/conversation/conversations-page";
import { EmptyConversation } from "@/pages/conversation/empty-conversation";
import { ConversationDetails } from "@/pages/conversation/conversation-details/conversation-details";
import { InstagramPage } from "@/pages/instagram-page/instagram-page";
import { InstagramPostPage } from "@/pages/instagram-page/instagram-post-page";
import { TeamMembersPage } from "@/pages/team-page/team-members/team-members-page";
import { TeamPage } from "@/pages/team-page/team-page";
import { TeamRoleDetailView } from "@/pages/team-page/team-roles/team-role-detail-view";
import { TeamRolesIndex } from "@/pages/team-page/team-roles/team-roles-index";
import { TeamRolesPage } from "@/pages/team-page/team-roles/team-roles-page";

export const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={pagesMap.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={pagesMap.home} element={<HomePage />}>
          <Route index element={<QuickActionsPage />} />
          <Route path="conversations" element={<ConversationsPage />}>
            <Route index element={<EmptyConversation />} />
            <Route path=":conversationId" element={<ConversationDetails />} />
          </Route>
          <Route path="instagram" element={<InstagramPage />} />
          <Route path="instagram/:postId" element={<InstagramPostPage />} />
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
            <Route path="templates" element={<SettingsTemplatesLayout />}>
              <Route index element={<SettingsTemplatesIndex />} />
              <Route
                path=":templateId"
                element={<SettingsTemplateDetailView />}
              />
            </Route>
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
            <Route
              path="characteristics"
              element={<ProductsCharacteristicsLayout />}
            >
              <Route index element={<ProductsCharacteristicsIndex />} />
              <Route
                path=":characteristicId"
                element={<ProductCharacteristicDetailView />}
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
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="clients" element={<ClientsPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.clientsWorkspace} replace />}
            />
            <Route path="clients" element={<ClientsListPage />} />
          </Route>
          <Route path="team" element={<TeamPage />}>
            <Route
              index
              element={<Navigate to={pagesMap.teamMembers} replace />}
            />
            <Route path="members" element={<TeamMembersPage />} />
            <Route path="roles" element={<TeamRolesPage />}>
              <Route index element={<TeamRolesIndex />} />
              <Route path=":roleId" element={<TeamRoleDetailView />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route
        path={pagesMap.fallback}
        element={<Navigate to={pagesMap.home} replace />}
      />
    </Routes>
  );
};
