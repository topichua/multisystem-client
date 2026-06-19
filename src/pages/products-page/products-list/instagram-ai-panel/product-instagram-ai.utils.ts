import type {
  InstagramMediaItem,
  InstagramPostAiExtractionMedia,
  InstagramPostAiExtractionResponse,
} from "@/features/instagram/model/instagram.types";
import { getPostMediaDisplaySource } from "@/pages/instagram-page/utils/instagram-page-format";

import type { ProductInstagramAiCategoryOption } from "./product-instagram-ai.types";

export type ProductInstagramPostMedia = {
  key: string;
  mediaType: string;
  url: string;
};

export type ProductInstagramDisplayAttribute = {
  name: string;
  values: string[];
};

export const getPostMediaItems = (
  post: InstagramMediaItem,
): ProductInstagramPostMedia[] => {
  const childMedia =
    post.children
      ?.filter((child) => Boolean(child.media_url))
      .map((child) => ({
        key: child.id,
        mediaType: child.media_type,
        url: child.media_url!,
      })) ?? [];

  if (childMedia.length > 0) {
    return childMedia;
  }

  const mediaSource = getPostMediaDisplaySource(post);

  return mediaSource
    ? [{ key: post.id, mediaType: post.media_type, url: mediaSource.url }]
    : [];
};

export const formatExtractionPrice = (
  price: InstagramPostAiExtractionResponse["data"]["price"],
  emptyValue: string,
): string => (price == null ? emptyValue : `${price} ₴`);

export const getSelectedExtractionMedia = (
  extraction: InstagramPostAiExtractionResponse,
): InstagramPostAiExtractionMedia[] => {
  const selectedIds = new Set(extraction.data.selectedMediaIds);

  if (selectedIds.size === 0) {
    return extraction.media;
  }

  const selected = extraction.media.filter((media) =>
    selectedIds.has(media.mediaId),
  );

  return selected.length > 0 ? selected : extraction.media;
};

export const getMatchedCategoryOptions = (
  extraction: InstagramPostAiExtractionResponse,
  categoryOptions: readonly ProductInstagramAiCategoryOption[],
): ProductInstagramAiCategoryOption[] => {
  const optionById = new Map(
    categoryOptions.map((option) => [String(option.value), option]),
  );

  return extraction.data.matchedCategoryIds
    .map((categoryId) => optionById.get(String(categoryId)))
    .filter(
      (option): option is ProductInstagramAiCategoryOption => option != null,
    );
};

export const getDisplayAttributes = (
  extraction: InstagramPostAiExtractionResponse,
): ProductInstagramDisplayAttribute[] => {
  const matchedAttributes = extraction.data.matchedFields.map((field) => ({
    name: field.name ?? field.attributeName,
    values: field.values.map((value) => value.optionName),
  }));
  const matchedNames = new Set(
    extraction.data.matchedFields.map((field) =>
      normalizeExtractionLabel(field.attributeName),
    ),
  );
  const unmatchedAttributes = extraction.data.attributes.filter(
    (attribute) => !matchedNames.has(normalizeExtractionLabel(attribute.name)),
  );

  return [...matchedAttributes, ...unmatchedAttributes]
    .map((attribute) => ({
      name: attribute.name.trim(),
      values: attribute.values.map((value) => value.trim()).filter(Boolean),
    }))
    .filter(
      (attribute) => attribute.name !== "" && attribute.values.length > 0,
    );
};

const normalizeExtractionLabel = (value: string): string =>
  value.trim().toLowerCase();
