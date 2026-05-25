import type { ProductDetails } from '@/features/products/model/product.types';

import { filterProductMediaItems } from '../product-detail/product-detail-media';

export const MEDIA_TILE_SIZE = 96;

export type GalleryItem = {
  id: string;
  file?: File;
  previewUrl: string;
};

export const buildGalleryFromProduct = (product: ProductDetails): GalleryItem[] => {
  const seen = new Set<string>();
  const items: GalleryItem[] = [];

  const addUrl = (url: string, id: string) => {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    items.push({ id, previewUrl: trimmed });
  };

  if (product.mainImageUrl) {
    addUrl(product.mainImageUrl, 'cover-main');
  }

  for (const media of filterProductMediaItems(product)) {
    addUrl(media.url, `media-${media.id}`);
  }

  return items;
};

export const createGalleryItemFromFile = (file: File): GalleryItem => {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    file,
    previewUrl: URL.createObjectURL(file),
  };
};

export const resolveActiveCoverId = (
  items: GalleryItem[],
  coverId: string | null,
): string | null => {
  if (items.length === 0) {
    return null;
  }
  if (coverId != null && items.some((item) => item.id === coverId)) {
    return coverId;
  }
  return items[0].id;
};
