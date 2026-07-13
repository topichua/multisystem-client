import type { ReactNode } from "react";
import {
  ChatsCircleIcon,
  ChartLineUpIcon,
  GearSixIcon,
  GlobeIcon,
  HouseIcon,
  InstagramLogoIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  UsersThreeIcon,
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

export type QuickActionNavItem = NavItemBase & {
  key:
    | "chats"
    | "products"
    | "orders"
    | "clients"
    | "integrations"
    | "settings";
  descriptionKey: string;
  icon: ReactNode;
  accent: string;
  accentBg: {
    light: string;
    dark: string;
  };
};

export type SectionNavItem = NavItemBase & {
  key: string;
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
    key: "instagram",
    path: pagesMap.instagram,
    labelKey: "nav.instagram",
    icon: <InstagramLogoIcon size={24} />,
  },
  {
    key: "products",
    path: pagesMap.products,
    labelKey: "nav.products",
    icon: <PackageIcon size={24} />,
  },
  {
    key: "orders",
    path: pagesMap.orders,
    labelKey: "nav.orders",
    icon: <ReceiptIcon size={24} />,
  },
  {
    key: "clients",
    path: pagesMap.clients,
    labelKey: "nav.clients",
    icon: <UsersThreeIcon size={24} />,
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

export const quickActionNavItems: readonly QuickActionNavItem[] = [
  {
    key: "chats",
    labelKey: "quickActions.cards.chats.title",
    descriptionKey: "quickActions.cards.chats.description",
    path: pagesMap.conversations,
    icon: <ChatsCircleIcon />,
    accent: base.violet[7],
    accentBg: {
      light: base.violet[2],
      dark: darkColors.functional.background.promotion,
    },
  },
  {
    key: "products",
    labelKey: "quickActions.cards.products.title",
    descriptionKey: "quickActions.cards.products.description",
    path: pagesMap.products,
    icon: <PackageIcon />,
    accent: brandPalette[7],
    accentBg: {
      light: brandPalette[2],
      dark: darkColors.functional.background.active,
    },
  },
  {
    key: "orders",
    labelKey: "quickActions.cards.orders.title",
    descriptionKey: "quickActions.cards.orders.description",
    path: pagesMap.orders,
    icon: <ReceiptIcon />,
    accent: base.volcano[6],
    accentBg: {
      light: base.volcano[2],
      dark: darkColors.base.volcano[9],
    },
  },
  {
    key: "clients",
    labelKey: "quickActions.cards.clients.title",
    descriptionKey: "quickActions.cards.clients.description",
    path: pagesMap.clients,
    icon: <UsersThreeIcon />,
    accent: base.cyan[6],
    accentBg: {
      light: base.cyan[2],
      dark: darkColors.base.cyan[9],
    },
  },
  {
    key: "integrations",
    labelKey: "quickActions.cards.integrations.title",
    descriptionKey: "quickActions.cards.integrations.description",
    path: pagesMap.settingsIntegrations,
    icon: <GlobeIcon />,
    accent: base.green[6],
    accentBg: {
      light: base.green[2],
      dark: darkColors.functional.background.success,
    },
  },
  {
    key: "settings",
    labelKey: "quickActions.cards.settings.title",
    descriptionKey: "quickActions.cards.settings.description",
    path: pagesMap.settings,
    icon: <GearSixIcon />,
    accent: base.pink[6],
    accentBg: {
      light: base.pink[2],
      dark: darkColors.base.pink[9],
    },
  },
] as const;

export const productsSectionNavItems = [
  {
    key: "products-list",
    path: pagesMap.productsList,
    labelKey: "products.listTitle",
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
    labelKey: "characteristics.title",
  },
] as const satisfies readonly SectionNavItem[];

export const ordersSectionNavItems = [
  {
    key: "orders-list",
    path: pagesMap.ordersList,
    labelKey: "orders.listTitle",
  },
] as const satisfies readonly SectionNavItem[];

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

export const clientsSectionNavItems: readonly SectionNavItem[] = [
  {
    key: "clients-workspace",
    path: pagesMap.clientsWorkspace,
    labelKey: "clients.pageTitle",
  },
] as const;

export const settingsSectionNavItems = [
  {
    key: "settings-groups",
    path: pagesMap.settingsGroups,
    labelKey: "settings.menu.groups",
  },
  {
    key: "settings-templates",
    path: pagesMap.settingsTemplates,
    labelKey: "settings.menu.templates",
  },
  {
    key: "settings-statuses",
    path: pagesMap.settingsOrderStatuses,
    labelKey: "settings.menu.statuses",
  },
  {
    key: "settings-user",
    path: pagesMap.settingsUser,
    labelKey: "settings.menu.user",
  },
  {
    key: "settings-system",
    path: pagesMap.settingsSystem,
    labelKey: "settings.menu.system",
  },
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
] as const satisfies readonly SectionNavItem[];

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

function doesPathMatch(path: string, pathname: string, exact = false): boolean {
  if (exact || path === pagesMap.home) {
    return pathname === path;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isNavItemActive(item: NavItemBase, pathname: string) {
  const matchPaths = item.matchPaths ?? [item.path];
  return matchPaths.some((path) => doesPathMatch(path, pathname));
}

export function getSelectedMobileNavKey(
  pathname: string,
): MobileNavItemKey | undefined {
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
}

export function getSelectedSectionNavPath(
  items: readonly SectionNavItem[],
  pathname: string,
): string {
  return (
    items.find((item) => isNavItemActive(item, pathname))?.path ??
    items[0]?.path ??
    ""
  );
}
