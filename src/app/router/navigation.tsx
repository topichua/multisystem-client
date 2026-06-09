import type { ReactNode } from "react";
import {
  ChatsCircleIcon,
  ChartLineUpIcon,
  GearSixIcon,
  GlobeIcon,
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

export const mainNavItems: readonly MainNavItem[] = [
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
    key: "analytics",
    path: pagesMap.analytics,
    labelKey: "nav.analytics",
    icon: <ChartLineUpIcon size={24} />,
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

export const productsSectionNavItems: readonly SectionNavItem[] = [
  {
    key: "products-list",
    path: pagesMap.productsList,
    labelKey: "products.listTitle",
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
] as const;

export const ordersSectionNavItems: readonly SectionNavItem[] = [
  {
    key: "orders-list",
    path: pagesMap.ordersList,
    labelKey: "orders.listTitle",
  },
  {
    key: "orders-statuses",
    path: pagesMap.ordersStatuses,
    labelKey: "orders.menu.statuses",
  },
] as const;

export const clientsSectionNavItems: readonly SectionNavItem[] = [
  {
    key: "clients-workspace",
    path: pagesMap.clientsWorkspace,
    labelKey: "clients.pageTitle",
  },
] as const;

export const settingsSectionNavItems: readonly SectionNavItem[] = [
  {
    key: "settings-groups",
    path: pagesMap.settingsGroups,
    labelKey: "settings.menu.groups",
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
] as const;

export function isNavItemActive(item: NavItemBase, pathname: string) {
  const matchPaths = item.matchPaths ?? [item.path];
  return matchPaths.some((path) => pathname.startsWith(path));
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
