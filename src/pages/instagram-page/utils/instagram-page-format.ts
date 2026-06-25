import type { InstagramMediaFilter } from "@/features/instagram/model/instagram.types";
import { formatDate } from "@/utils/date-time";
export {
  getPostCoverUrl,
  getPostMediaDisplaySource,
} from "@/features/products/utils/instagram-media-display";

export const mediaFilters: readonly InstagramMediaFilter[] = [
  "all",
  "without-product",
  "linked",
];

export const formatHandle = (name: string): string =>
  name.startsWith("@") ? name : `@${name}`;

export const formatCompactNumber = (value: number | undefined): string => {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPostDate = (value: string | undefined): string => {
  if (!value) {
    return "—";
  }

  return formatDate(value) || "—";
};

export const getFilterLabelKey = (filter: InstagramMediaFilter): string => {
  switch (filter) {
    case "linked":
      return "instagram.filters.linked";
    case "without-product":
      return "instagram.filters.withoutProduct";
    default:
      return "instagram.filters.all";
  }
};
