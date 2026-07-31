import { Route, Routes } from "react-router";
import { HomePage } from "@/pages/home-page/home-page";
import { QuickActionsPage } from "@/pages/home-page/quick-actions/quick-actions-page";
import { InvitationPage } from "@/pages/invitation-page/invitation-page";
import { LoginPage } from "@/pages/login-page/login-page";
import { ForgotPasswordPage } from "@/pages/password-reset-page/forgot-password-page";
import { ResetPasswordPage } from "@/pages/password-reset-page/reset-password-page";
import { RegisterConfirmPage } from "@/pages/register-page/register-confirm-page";
import { RegisterPage } from "@/pages/register-page/register-page";
import { SettingsPage } from "@/pages/settings-page/settings-page";
import { SettingsIndexRoute } from "@/pages/settings-page/settings-index-route";
import { SettingsGroupDetailRoute } from "@/pages/settings-page/settings-groups/settings-group-detail-route";
import { SettingsGroupsIndexRoute } from "@/pages/settings-page/settings-groups/settings-groups-index-route";
import { SettingsGroupsLayout } from "@/pages/settings-page/settings-groups/settings-groups-layout";
import { SettingsAutomationEditorRoute } from "@/pages/settings-page/settings-automation/settings-automation-editor-route";
import { SettingsAutomationListRoute } from "@/pages/settings-page/settings-automation/settings-automation-list-route";
import { SettingsBillingRoute } from "@/pages/settings-page/settings-billing-route";
import { SettingsSystemRoute } from "@/pages/settings-page/settings-system-route";
import { SettingsUserRoute } from "@/pages/settings-page/settings-user-route";
import { SettingsIntegrationsRoute } from "@/pages/settings-page/settings-integrations/settings-integrations-route";
import { OrderStatusDetailRoute } from "@/pages/settings-page/order-statuses/order-status-detail-route";
import { OrderStatusesIndexRoute } from "@/pages/settings-page/order-statuses/order-statuses-index-route";
import { OrderStatusesLayout } from "@/pages/settings-page/order-statuses/order-statuses-layout";
import { SettingsTemplateDetailRoute } from "@/pages/settings-page/settings-templates/settings-template-detail-route";
import { SettingsTemplatesIndexRoute } from "@/pages/settings-page/settings-templates/settings-templates-index-route";
import { SettingsTemplatesLayout } from "@/pages/settings-page/settings-templates/settings-templates-layout";
import { ProductsIndexRoute } from "@/pages/products-page/products-index-route";
import { ProductsPage } from "@/pages/products-page/products-page";
import { ProductsCategoriesRoute } from "@/pages/products-page/products-categories/products-categories-route";
import { ProductsCharacteristicsLayout } from "@/pages/products-page/products-characteristics/products-characteristics-layout";
import { ProductsCharacteristicsIndexRoute } from "@/pages/products-page/products-characteristics/products-characteristics-index-route";
import { ProductCharacteristicDetailRoute } from "@/pages/products-page/products-characteristics/product-characteristic-detail-route";
import { ProductAddPage } from "@/pages/products-page/products-list/pages/product-add-page";
import { ProductsListRoute } from "@/pages/products-page/products-list/list/products-list-route";
import { ProductsInventoryHistoryRoute } from "@/pages/products-page/products-inventory-history/products-inventory-history-route";
import { ClientsIndexRoute } from "@/pages/clients-page/clients-index-route";
import { ClientDetailRoute } from "@/pages/clients-page/client-details/client-detail-route";
import { ClientsListRoute } from "@/pages/clients-page/clients-list/clients-list-route";
import { ClientsPage } from "@/pages/clients-page/clients-page";
import { OrdersIndexRoute } from "@/pages/orders-page/orders-index-route";
import { OrdersPage } from "@/pages/orders-page/orders-page";
import { OrdersListRoute } from "@/pages/orders-page/orders-list/orders-list-route";
import { OrdersNewPage } from "@/pages/orders-page/orders-new/orders-new-page";
import { OrderDetailsPage } from "@/pages/orders-page/order-details/order-details-page";

import { NotFoundPage } from "@/pages/not-found-page/not-found-page";
import { pagesMap } from "./pages-map";
import { ProtectedRoute } from "./protected-route";
import { PublicOnlyRoute } from "./public-only-route";
import { AnalyticsPage } from "@/pages/analytics-page/analytics-page";
import { AnalyticsIndexRoute } from "@/pages/analytics-page/analytics-index-route";
import { AnalyticsCustomersRoute } from "@/pages/analytics-page/customers/analytics-customers-route";
import { AnalyticsInstagramRoute } from "@/pages/analytics-page/instagram/analytics-instagram-route";
import { AnalyticsOverviewRoute } from "@/pages/analytics-page/overview/analytics-overview-route";
import { AnalyticsProductsRoute } from "@/pages/analytics-page/products/analytics-products-route";
import { AnalyticsSalesRoute } from "@/pages/analytics-page/sales/analytics-sales-route";
import { AnalyticsWishlistRoute } from "@/pages/analytics-page/wishlist/analytics-wishlist-route";
import { ConversationDetailRoute } from "@/pages/conversation/conversation-detail-route";
import { ConversationsIndexRoute } from "@/pages/conversation/conversations-index-route";
import { ConversationsPage } from "@/pages/conversation/conversations-page";
import { InstagramPageRoute } from "@/pages/instagram-page/instagram-page-route";
import { InstagramPostPageRoute } from "@/pages/instagram-page/instagram-post-page-route";
import { TeamIndexRoute } from "@/pages/team-page/team-index-route";
import { TeamMembersRoute } from "@/pages/team-page/team-members/team-members-route";
import { TeamPage } from "@/pages/team-page/team-page";
import { TeamRoleDetailRoute } from "@/pages/team-page/team-roles/team-role-detail-route";
import { TeamRolesIndexRoute } from "@/pages/team-page/team-roles/team-roles-index-route";
import { TeamRolesPage } from "@/pages/team-page/team-roles/team-roles-page";

export const PageRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={pagesMap.login} element={<LoginPage />} />
        <Route
          path={pagesMap.forgotPassword}
          element={<ForgotPasswordPage />}
        />
        <Route path={pagesMap.resetPassword} element={<ResetPasswordPage />} />
        <Route path={pagesMap.register} element={<RegisterPage />} />
        <Route
          path={pagesMap.registerConfirm}
          element={<RegisterConfirmPage />}
        />
        <Route
          path={`${pagesMap.registerConfirm}/:token`}
          element={<RegisterConfirmPage />}
        />
        <Route path={pagesMap.invitation} element={<InvitationPage />} />
        <Route
          path={`${pagesMap.invitation}/:token`}
          element={<InvitationPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={pagesMap.home} element={<HomePage />}>
          <Route index element={<QuickActionsPage />} />
          <Route path="conversations" element={<ConversationsPage />}>
            <Route index element={<ConversationsIndexRoute />} />
            <Route
              path=":conversationId"
              element={<ConversationDetailRoute />}
            />
          </Route>
          <Route path="instagram" element={<InstagramPageRoute />} />
          <Route
            path="instagram/:postId"
            element={<InstagramPostPageRoute />}
          />
          <Route path="settings">
            <Route index element={<SettingsIndexRoute />} />
            <Route element={<SettingsPage />}>
              <Route path="groups" element={<SettingsGroupsLayout />}>
                <Route index element={<SettingsGroupsIndexRoute />} />
                <Route path=":groupId" element={<SettingsGroupDetailRoute />} />
              </Route>
              <Route path="user" element={<SettingsUserRoute />} />
              <Route path="system" element={<SettingsSystemRoute />} />
              <Route path="integrations">
                <Route index element={<SettingsIntegrationsRoute />} />
                <Route path="tiktok" element={<SettingsIntegrationsRoute />} />
              </Route>
              <Route path="billing" element={<SettingsBillingRoute />} />
              <Route path="templates" element={<SettingsTemplatesLayout />}>
                <Route index element={<SettingsTemplatesIndexRoute />} />
                <Route
                  path=":templateId"
                  element={<SettingsTemplateDetailRoute />}
                />
              </Route>
              <Route path="statuses" element={<OrderStatusesLayout />}>
                <Route index element={<OrderStatusesIndexRoute />} />
                <Route path=":statusId" element={<OrderStatusDetailRoute />} />
              </Route>
              <Route path="automation">
                <Route index element={<SettingsAutomationListRoute />} />
                <Route path="new" element={<SettingsAutomationEditorRoute />} />
                <Route
                  path=":ruleId"
                  element={<SettingsAutomationEditorRoute />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="products">
            <Route index element={<ProductsIndexRoute />} />
            <Route element={<ProductsPage />}>
              <Route path="list/add" element={<ProductAddPage />} />
              <Route
                path="list/product/:productId"
                element={<ProductAddPage />}
              />
              <Route path="list" element={<ProductsListRoute />} />
              <Route path="categories" element={<ProductsCategoriesRoute />} />
              <Route
                path="categories/:categoryId"
                element={<ProductsCategoriesRoute />}
              />
              <Route
                path="characteristics"
                element={<ProductsCharacteristicsLayout />}
              >
                <Route index element={<ProductsCharacteristicsIndexRoute />} />
                <Route
                  path=":characteristicId"
                  element={<ProductCharacteristicDetailRoute />}
                />
              </Route>
              <Route
                path="inventory-history"
                element={<ProductsInventoryHistoryRoute />}
              />
            </Route>
          </Route>
          <Route path="orders">
            <Route index element={<OrdersIndexRoute />} />
            <Route element={<OrdersPage />}>
              <Route path="list" element={<OrdersListRoute />} />
              <Route path="new" element={<OrdersNewPage />} />
              <Route path=":orderId" element={<OrderDetailsPage />} />
            </Route>
          </Route>
          <Route path="analytics">
            <Route index element={<AnalyticsIndexRoute />} />
            <Route element={<AnalyticsPage />}>
              <Route path="overview" element={<AnalyticsOverviewRoute />} />
              <Route path="sales" element={<AnalyticsSalesRoute />} />
              <Route path="products" element={<AnalyticsProductsRoute />} />
              <Route path="instagram" element={<AnalyticsInstagramRoute />} />
              <Route path="wishlist" element={<AnalyticsWishlistRoute />} />
              <Route path="customers" element={<AnalyticsCustomersRoute />} />
            </Route>
          </Route>
          <Route path="clients">
            <Route index element={<ClientsIndexRoute />} />
            <Route element={<ClientsPage />}>
              <Route path="clients" element={<ClientsListRoute />} />
              <Route path=":clientId" element={<ClientDetailRoute />} />
            </Route>
          </Route>
          <Route path="team">
            <Route index element={<TeamIndexRoute />} />
            <Route element={<TeamPage />}>
              <Route path="members" element={<TeamMembersRoute />} />
              <Route path="roles" element={<TeamRolesPage />}>
                <Route index element={<TeamRolesIndexRoute />} />
                <Route path=":roleId" element={<TeamRoleDetailRoute />} />
              </Route>
            </Route>
          </Route>
          <Route path={pagesMap.fallback} element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
