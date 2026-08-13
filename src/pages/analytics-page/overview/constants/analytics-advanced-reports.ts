import {
  ChartLineUpIcon,
  ChatsCircleIcon,
  PackageIcon,
  StarIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import { pagesMap } from "@/app/router/pages-map";

export type AnalyticsAdvancedReportKey =
  "sales" | "products" | "customers" | "instagram" | "wishlist";

export type AnalyticsAdvancedReportItem = {
  key: AnalyticsAdvancedReportKey;
  path: string;
  titleKey: string;
  descriptionKey: string;
  icon: Icon;
  accent: string;
  accentBg: string;
};

export const ANALYTICS_ADVANCED_REPORT_ITEMS: readonly AnalyticsAdvancedReportItem[] =
  [
    {
      key: "sales",
      path: pagesMap.analyticsSales,
      titleKey: "analytics.overview.advancedAnalytics.reports.sales.title",
      descriptionKey:
        "analytics.overview.advancedAnalytics.reports.sales.description",
      icon: ChartLineUpIcon,
      accent: "#D23F57",
      accentBg: "#FDECEF",
    },
    {
      key: "products",
      path: pagesMap.analyticsProducts,
      titleKey: "analytics.overview.advancedAnalytics.reports.products.title",
      descriptionKey:
        "analytics.overview.advancedAnalytics.reports.products.description",
      icon: PackageIcon,
      accent: "#C97D1E",
      accentBg: "#FFF7E8",
    },
    {
      key: "customers",
      path: pagesMap.analyticsCustomers,
      titleKey: "analytics.overview.advancedAnalytics.reports.customers.title",
      descriptionKey:
        "analytics.overview.advancedAnalytics.reports.customers.description",
      icon: UsersThreeIcon,
      accent: "#2372E2",
      accentBg: "#E9F2FF",
    },
    {
      key: "instagram",
      path: pagesMap.analyticsInstagram,
      titleKey: "analytics.overview.advancedAnalytics.reports.instagram.title",
      descriptionKey:
        "analytics.overview.advancedAnalytics.reports.instagram.description",
      icon: ChatsCircleIcon,
      accent: "#6F2FCC",
      accentBg: "#F4EEFB",
    },
    {
      key: "wishlist",
      path: pagesMap.analyticsWishlist,
      titleKey: "analytics.overview.advancedAnalytics.reports.wishlist.title",
      descriptionKey:
        "analytics.overview.advancedAnalytics.reports.wishlist.description",
      icon: StarIcon,
      accent: "#C97D1E",
      accentBg: "#FFF7E8",
    },
  ] as const;
