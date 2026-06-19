export const pagesMap = {
  home: "/",
  conversations: "/conversations",
  instagram: "/instagram",
  products: "/products",
  productsList: "/products/list",
  productsListAdd: "/products/list/add",
  productsCategories: "/products/categories",
  productsCharacteristics: "/products/characteristics",
  orders: "/orders",
  ordersList: "/orders/list",
  ordersStatuses: "/orders/statuses",
  analytics: "/analytics",
  clients: "/clients",
  team: "/team",
  teamMembers: "/team/members",
  teamRoles: "/team/roles",
  clientsWorkspace: "/clients/clients",
  settings: "/settings",
  settingsGroups: "/settings/groups",
  settingsUser: "/settings/user",
  settingsSystem: "/settings/system",
  settingsIntegrations: "/settings/integrations",
  settingsTemplates: "/settings/templates",
  login: "/login",
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
  `${pagesMap.ordersStatuses}/${statusId}`;

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
