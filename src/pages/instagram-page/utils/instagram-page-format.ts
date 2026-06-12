import dayjs from "dayjs";

import type { InstagramMediaFilter } from "@/features/instagram/model/instagram.types";
import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

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

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("D MMM YYYY") : "—";
};

export const getPostCoverUrl = (post: InstagramMediaItem): string | undefined =>
  post.thumbnail_url ??
  post.media_url ??
  post.children?.find((child) => child.media_url)?.media_url;

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
