export const pagesMap = {
  home: "/",
  conversations: "/conversations",
  products: "/products",
  productsList: "/products/list",
  productsListAdd: "/products/list/add",
  productsCategories: "/products/categories",
  productsCharacteristics: "/products/characteristics",
  orders: "/orders",
  ordersList: "/orders/list",
  ordersStatuses: "/orders/statuses",
  clients: "/clients",
  clientsWorkspace: "/clients/clients",
  settings: "/settings",
  settingsGroups: "/settings/groups",
  settingsUser: "/settings/user",
  settingsSystem: "/settings/system",
  settingsIntegrations: "/settings/integrations",
  login: "/login",
  fallback: "*",
} as const;

export const getSettingsGroupPath = (groupId: string | number) =>
  `${pagesMap.settingsGroups}/${groupId}`;

export const getOrderStatusPath = (statusId: string | number) =>
  `${pagesMap.ordersStatuses}/${statusId}`;

export const getProductCategoryPath = (categoryId: string | number) =>
  `${pagesMap.productsCategories}/${categoryId}`;

export const getProductCharacteristicPath = (
  characteristicId: string | number,
) => `${pagesMap.productsCharacteristics}/${characteristicId}`;

export const getProductEditPath = (productId: string | number): string =>
  `${pagesMap.productsList}/product/${productId}`;
