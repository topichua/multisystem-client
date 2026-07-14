import type { ComponentType, ReactNode } from "react";

import { AnalyticsProvider } from "@/features/analytics/model/analytics-provider";
import { AuthProvider } from "@/features/auth/model/auth-provider";
import { UserProvider } from "@/features/auth/model/user-provider";
import { BillingProvider } from "@/features/billing/model/billing-provider";
import { CategoriesProvider } from "@/features/categories/model/categories-provider";
import { CharacteristicsProvider } from "@/features/characteristics/model/characteristics-provider";
import { ClientsProvider } from "@/features/clients/model/clients-provider";
import { ConversationGroupsProvider } from "@/features/conversation-groups/model/conversation-groups-provider";
import { ConversationsProvider } from "@/features/conversations/model/conversations-provider";
import { InstagramProvider } from "@/features/instagram/model/instagram-provider";
import { InventoryProvider } from "@/features/inventory/model/inventory-provider";
import { MessageTemplatesProvider } from "@/features/message-templates/model/message-templates-provider";
import { AutomationProvider } from "@/features/automation/model/automation-provider";
import { OrdersProvider } from "@/features/orders/model/orders-provider";
import { ProductsProvider } from "@/features/products/model/products-provider";
import { WorkspaceMembersProvider } from "@/features/workspace-members/model/workspace-members-provider";
import { WorkspaceRolesProvider } from "@/features/workspace-roles/model/workspace-roles-provider";

type ProviderComponent = ComponentType<{ children: ReactNode }>;

const featureProviders: ProviderComponent[] = [
  AuthProvider,
  UserProvider,
  BillingProvider,
  AnalyticsProvider,
  ConversationsProvider,
  CategoriesProvider,
  CharacteristicsProvider,
  ClientsProvider,
  ProductsProvider,
  InventoryProvider,
  InstagramProvider,
  OrdersProvider,
  ConversationGroupsProvider,
  MessageTemplatesProvider,
  AutomationProvider,
  WorkspaceMembersProvider,
  WorkspaceRolesProvider,
];

export const FeatureProviders = ({ children }: { children: ReactNode }) =>
  featureProviders.reduceRight<ReactNode>(
    (providerTree, Provider) => <Provider>{providerTree}</Provider>,
    children,
  );
