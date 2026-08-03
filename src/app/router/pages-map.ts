export const pagesMap = {
  home: "/",
  conversations: "/conversations",
  instagram: "/instagram",
  products: "/products",
  productsList: "/products/list",
  productsListAdd: "/products/list/add",
  productsSupplies: "/products/supplies",
  productsCategories: "/products/categories",
  productsCharacteristics: "/products/characteristics",
  productsInventoryHistory: "/products/inventory-history",
  orders: "/orders",
  ordersList: "/orders/list",
  ordersNew: "/orders/new",
  analytics: "/analytics",
  analyticsOverview: "/analytics/overview",
  analyticsSales: "/analytics/sales",
  analyticsProducts: "/analytics/products",
  analyticsInstagram: "/analytics/instagram",
  analyticsWishlist: "/analytics/wishlist",
  analyticsCustomers: "/analytics/customers",
  clients: "/clients",
  team: "/team",
  teamMembers: "/team/members",
  teamRoles: "/team/roles",
  clientsWorkspace: "/clients/clients",
  clientsDetail: "/clients",
  settings: "/settings",
  settingsGroups: "/settings/groups",
  settingsUser: "/settings/user",
  settingsSystem: "/settings/system",
  settingsIntegrations: "/settings/integrations",
  settingsIntegrationsTiktok: "/settings/integrations/tiktok",
  settingsBilling: "/settings/billing",
  settingsTemplates: "/settings/templates",
  settingsOrderStatuses: "/settings/statuses",
  settingsAutomation: "/settings/automation",
  settingsAutomationNew: "/settings/automation/new",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  register: "/register",
  registerConfirm: "/register/confirm",
  invitation: "/invitation",
  fallback: "*",
} as const;

export const getSettingsGroupPath = (groupId: string | number) =>
  `${pagesMap.settingsGroups}/${groupId}`;

export const getSettingsTemplatePath = (templateId: string | number) =>
  `${pagesMap.settingsTemplates}/${templateId}`;

export const getTeamRolePath = (roleId: string | number) =>
  `${pagesMap.teamRoles}/${roleId}`;

export const getOrderStatusPath = (statusId: string | number) =>
  `${pagesMap.settingsOrderStatuses}/${statusId}`;

export const getSettingsAutomationPath = (ruleId: string | number) =>
  `${pagesMap.settingsAutomation}/${ruleId}`;

export const getOrderDetailsPath = (orderId: string | number): string =>
  `${pagesMap.orders}/${orderId}`;

export const getInstagramPostPath = (postId: string | number): string =>
  `${pagesMap.instagram}/${postId}`;

export const getProductCategoryPath = (categoryId: string | number) =>
  `${pagesMap.productsCategories}/${categoryId}`;

export const getProductCharacteristicPath = (
  characteristicId: string | number,
) => `${pagesMap.productsCharacteristics}/${characteristicId}`;

export const getProductEditPath = (productId: string | number): string =>
  `${pagesMap.productsList}/product/${productId}`;

export const getClientDetailsPath = (clientId: string | number): string =>
  `${pagesMap.clientsDetail}/${clientId}`;
