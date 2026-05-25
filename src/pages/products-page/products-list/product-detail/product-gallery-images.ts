import type { ProductDetails } from '@/features/products/model/product.types';

import { filterProductMediaItems } from './product-detail-media';

export type ProductGalleryImage = {
  id: string;
  url: string;
};

type GalleryLikeItem = {
  id: string;
  previewUrl: string;
};

export const collectProductGalleryImages = (
  product: ProductDetails | null,
  gallery: GalleryLikeItem[] = [],
): ProductGalleryImage[] => {
  const seen = new Set<string>();
  const items: ProductGalleryImage[] = [];

  const add = (id: string, url: string) => {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    items.push({ id, url: trimmed });
  };

  if (product?.mainImageUrl) {
    add('cover-main', product.mainImageUrl);
  }

  for (const media of filterProductMediaItems(product)) {
    add(`media-${media.id}`, media.url);
  }

  for (const item of gallery) {
    add(item.id, item.previewUrl);
  }

  return items;
};

/** Media records whose URLs are no longer present in the edited gallery. */
export const collectRemovedProductMediaIds = (
  product: ProductDetails,
  remainingUrls: Iterable<string>,
): number[] => {
  const remaining = new Set([...remainingUrls].map((url) => url.trim()).filter(Boolean));

  return filterProductMediaItems(product)
    .filter((item) => !remaining.has(item.url.trim()))
    .map((item) => item.id);
};
