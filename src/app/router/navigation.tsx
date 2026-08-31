import type { ReactNode } from "react";
import {
  ChatsCircleIcon,
  ChartLineUpIcon,
  GearSixIcon,
  GlobeIcon,
  HouseIcon,
  ShareNetworkIcon,
  UsersIcon,
  UsersThreeIcon,
  TagIcon,
  CubeIcon,
} from "@phosphor-icons/react";

import * as darkColors from "@/styled/definitions/colors.dark";
import { base, brandPalette } from "@/styled/definitions/colors";

import { pagesMap } from "./pages-map";

type NavItemBase = {
  path: string;
  labelKey: string;
  matchPaths?: readonly string[];
};

export type MainNavItem = NavItemBase & {
  key:
    | "chats"
    | "instagram"
    | "products"
    | "orders"
    | "analytics"
    | "clients"
    | "team"
    | "settings";
  icon: ReactNode;
};

type QuickActionPresentation = {
  descriptionKey: string;
  accent: string;
  accentBg: {
    light: string;
    dark: string;
  };
  surfaceTint: {
    light: string;
    dark: string;
  };
};

export type QuickActionNavItem = MainNavItem & QuickActionPresentation;

export type SectionNavItem = NavItemBase & {
  key: string;
};

export type SectionNavGroup = {
  key: string;
  titleKey: string;
  items: readonly SectionNavItem[];
};

export type AnalyticsSectionNavItem = SectionNavItem & {
  pro?: boolean;
};

export type MobileNavItemKey = MainNavItem["key"] | "home" | "integrations";

export type MobileNavItem = NavItemBase & {
  key: MobileNavItemKey;
  icon: ReactNode;
  exact?: boolean;
};

export type MobileNavSection = {
  key: "workspace" | "daily-work" | "customers-workspace";
  titleKey: string;
  items: readonly MobileNavItem[];
};

export const mainNavItems: readonly MainNavItem[] = [
  {
    key: "analytics",
    path: pagesMap.analytics,
    labelKey: "nav.analytics",
    icon: <ChartLineUpIcon size={24} />,
  },
  {
    key: "chats",
    path: pagesMap.conversations,
    labelKey: "nav.chats",
    icon: <ChatsCircleIcon size={24} />,
  },
  {
    key: "orders",
    path: pagesMap.orders,
    labelKey: "nav.orders",
    icon: <TagIcon size={24} />,
  },
  {
    key: "products",
    path: pagesMap.products,
    labelKey: "nav.products",
    icon: <CubeIcon size={24} />,
  },
  {
    key: "clients",
    path: pagesMap.clients,
    labelKey: "nav.clients",
    icon: <UsersThreeIcon size={24} />,
  },
  {
    key: "instagram",
    path: pagesMap.instagram,
    labelKey: "nav.instagram",
    icon: <ShareNetworkIcon size={24} />,
  },
  {
    key: "team",
    path: pagesMap.team,
    labelKey: "nav.team",
    icon: <UsersIcon size={24} />,
  },
  {
    key: "settings",
    path: pagesMap.settings,
    labelKey: "nav.settings",
    icon: <GearSixIcon size={24} />,
  },
] as const;

const quickActionPresentationByKey: Record<
  MainNavItem["key"],
  QuickActionPresentation
> = {
  analytics: {
    descriptionKey: "quickActions.cards.analytics.description",
    accent: base.blue[6],
    accentBg: {
      light: base.blue[2],
      dark: darkColors.base.blue[9],
    },
    surfaceTint: {
      light: base.blue[1],
      dark: darkColors.base.blue[10],
    },
  },
  chats: {
    descriptionKey: "quickActions.cards.chats.description",
    accent: base.violet[7],
    accentBg: {
      light: base.violet[2],
      dark: darkColors.functional.background.promotion,
    },
    surfaceTint: {
      light: base.violet[1],
      dark: darkColors.functional.background.promotion,
    },
  },
  orders: {
    descriptionKey: "quickActions.cards.orders.description",
    accent: base.volcano[6],
    accentBg: {
      light: base.volcano[2],
      dark: darkColors.base.volcano[9],
    },
    surfaceTint: {
      light: base.volcano[1],
      dark: darkColors.base.volcano[10],
    },
  },
  products: {
    descriptionKey: "quickActions.cards.products.description",
    accent: brandPalette[7],
    accentBg: {
      light: brandPalette[2],
      dark: darkColors.functional.background.active,
    },
    surfaceTint: {
      light: brandPalette[1],
      dark: darkColors.functional.background.active,
    },
  },
  clients: {
    descriptionKey: "quickActions.cards.clients.description",
    accent: base.cyan[6],
    accentBg: {
      light: base.cyan[2],
      dark: darkColors.base.cyan[9],
    },
    surfaceTint: {
      light: base.cyan[1],
      dark: darkColors.base.cyan[10],
    },
  },
  instagram: {
    descriptionKey: "quickActions.cards.instagram.description",
    accent: base.pink[6],
    accentBg: {
      light: base.pink[2],
      dark: darkColors.base.pink[9],
    },
    surfaceTint: {
      light: base.pink[1],
      dark: darkColors.base.pink[10],
    },
  },
  team: {
    descriptionKey: "quickActions.cards.team.description",
    accent: base.magenta[6],
    accentBg: {
      light: base.magenta[2],
      dark: darkColors.base.magenta[9],
    },
    surfaceTint: {
      light: base.magenta[1],
      dark: darkColors.base.magenta[10],
    },
  },
  settings: {
    descriptionKey: "quickActions.cards.settings.description",
    accent: base.pink[6],
    accentBg: {
      light: base.pink[2],
      dark: darkColors.base.pink[9],
    },
    surfaceTint: {
      light: base.pink[1],
      dark: darkColors.base.pink[10],
    },
  },
};

export const quickActionNavItems: readonly QuickActionNavItem[] =
  mainNavItems.map((item) => ({
    ...item,
    ...quickActionPresentationByKey[item.key],
  }));

export const productsSectionNavItems = [
  {
    key: "products-list",
    path: pagesMap.productsList,
    labelKey: "products.listTitle",
  },
  {
    key: "products-supplies",
    path: pagesMap.productsSupplies,
    labelKey: "products.suppliesTitle",
  },
  {
    key: "products-inventory-history",
    path: pagesMap.productsInventoryHistory,
    labelKey: "products.inventoryHistoryTitle",
  },
  {
    key: "products-categories",
    path: pagesMap.productsCategories,
    labelKey: "categories.title",
  },
  {
    key: "products-characteristics",
    path: pagesMap.productsCharacteristics,
    labelKey: "products.fieldsTitle",
  },
] as const satisfies readonly SectionNavItem[];

export type ProductsSectionNavItem = (typeof productsSectionNavItems)[number];

const ADVANCED_INVENTORY_PRODUCT_NAV_KEYS = new Set<
  ProductsSectionNavItem["key"]
>(["products-supplies", "products-inventory-history"]);

export const getVisibleProductsSectionNavItems = (
  includeAdvancedInventory: boolean,
): readonly ProductsSectionNavItem[] => {
  if (includeAdvancedInventory) {
    return productsSectionNavItems;
  }

  return productsSectionNavItems.filter(
    (item) => !ADVANCED_INVENTORY_PRODUCT_NAV_KEYS.has(item.key),
  );
};

export const teamSectionNavItems = [
  {
    key: "team-members",
    path: pagesMap.teamMembers,
    labelKey: "team.menu.members",
  },
  {
    key: "team-roles",
    path: pagesMap.teamRoles,
    labelKey: "team.menu.roles",
  },
] as const satisfies readonly SectionNavItem[];

export const analyticsSectionNavItems = [
  {
    key: "analytics-overview",
    path: pagesMap.analyticsOverview,
    labelKey: "analytics.menu.overview",
  },
  {
    key: "analytics-sales",
    path: pagesMap.analyticsSales,
    labelKey: "analytics.menu.sales",
    pro: true,
  },
  {
    key: "analytics-products",
    path: pagesMap.analyticsProducts,
    labelKey: "analytics.menu.products",
    pro: true,
  },
  {
    key: "analytics-instagram",
    path: pagesMap.analyticsInstagram,
    labelKey: "analytics.menu.instagram",
    pro: true,
  },
  {
    key: "analytics-wishlist",
    path: pagesMap.analyticsWishlist,
    labelKey: "analytics.menu.wishlist",
    pro: true,
  },
  {
    key: "analytics-customers",
    path: pagesMap.analyticsCustomers,
    labelKey: "analytics.menu.customers",
    pro: true,
  },
] as const satisfies readonly AnalyticsSectionNavItem[];

export const settingsSectionNavGroups = [
  {
    key: "account",
    titleKey: "settings.sections.account",
    items: [
      {
        key: "settings-user",
        path: pagesMap.settingsUser,
        labelKey: "settings.menu.user",
      },
    ],
  },
  {
    key: "workspace",
    titleKey: "settings.sections.workspace",
    items: [
      {
        key: "settings-system",
        path: pagesMap.settingsSystem,
        labelKey: "settings.menu.system",
      },
      {
        key: "settings-groups",
        path: pagesMap.settingsGroups,
        labelKey: "settings.menu.groups",
      },
      {
        key: "settings-statuses",
        path: pagesMap.settingsOrderStatuses,
        labelKey: "settings.menu.statuses",
      },
      {
        key: "settings-automation",
        path: pagesMap.settingsAutomation,
        labelKey: "settings.menu.automation",
      },
      {
        key: "settings-templates",
        path: pagesMap.settingsTemplates,
        labelKey: "settings.menu.templates",
      },
    ],
  },
  {
    key: "services",
    titleKey: "settings.sections.services",
    items: [
      {
        key: "settings-integrations",
        path: pagesMap.settingsIntegrations,
        labelKey: "settings.menu.integrations",
      },
      {
        key: "settings-billing",
        path: pagesMap.settingsBilling,
        labelKey: "settings.menu.billing",
      },
    ],
  },
] as const satisfies readonly SectionNavGroup[];

export const settingsSectionNavItems: readonly SectionNavItem[] = (
  settingsSectionNavGroups as readonly SectionNavGroup[]
).flatMap((group) => group.items);

const findMainNavItem = (key: MainNavItem["key"]): MainNavItem => {
  const item = mainNavItems.find((navItem) => navItem.key === key);

  if (!item) {
    throw new Error(`Missing main navigation item: ${key}`);
  }

  return item;
};

export const mobileNavSections = [
  {
    key: "workspace",
    titleKey: "nav.mobileSections.workspace",
    items: [
      {
        key: "home",
        path: pagesMap.home,
        labelKey: "nav.workspaceHome",
        icon: <HouseIcon size={24} />,
        exact: true,
      },
    ],
  },
  {
    key: "daily-work",
    titleKey: "nav.mobileSections.dailyWork",
    items: [
      findMainNavItem("analytics"),
      findMainNavItem("chats"),
      findMainNavItem("instagram"),
      findMainNavItem("products"),
      findMainNavItem("orders"),
    ],
  },
  {
    key: "customers-workspace",
    titleKey: "nav.mobileSections.customersWorkspace",
    items: [
      findMainNavItem("clients"),
      findMainNavItem("team"),
      {
        key: "integrations",
        path: pagesMap.settingsIntegrations,
        labelKey: "settings.menu.integrations",
        icon: <GlobeIcon size={24} />,
      },
      findMainNavItem("settings"),
    ],
  },
] as const satisfies readonly MobileNavSection[];

export const mobileNavItems: readonly MobileNavItem[] =
  mobileNavSections.reduce<MobileNavItem[]>((items, section) => {
    items.push(...section.items);
    return items;
  }, []);

const doesPathMatch = (
  path: string,
  pathname: string,
  exact = false,
): boolean => {
  if (exact || path === pagesMap.home) {
    return pathname === path;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
};

export const isNavItemActive = (item: NavItemBase, pathname: string) => {
  const matchPaths = item.matchPaths ?? [item.path];
  return matchPaths.some((path) => doesPathMatch(path, pathname));
};

export const getSelectedMobileNavKey = (
  pathname: string,
): MobileNavItemKey | undefined => {
  const integrationsActive = doesPathMatch(
    pagesMap.settingsIntegrations,
    pathname,
  );

  return mobileNavItems.find((item) => {
    if (item.key === "integrations") {
      return integrationsActive;
    }

    if (item.key === "settings" && integrationsActive) {
      return false;
    }

    const matchPaths = item.matchPaths ?? [item.path];

    return matchPaths.some((path) => doesPathMatch(path, pathname, item.exact));
  })?.key;
};

export const getSelectedSectionNavPath = (
  items: readonly SectionNavItem[],
  pathname: string,
): string => {
  return (
    items.find((item) => isNavItemActive(item, pathname))?.path ??
    items[0]?.path ??
    ""
  );
};
