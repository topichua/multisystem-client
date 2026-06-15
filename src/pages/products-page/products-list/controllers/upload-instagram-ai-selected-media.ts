import { productsApi } from "@/features/products/api/products-api";
import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";
import {
  fetchUrlAsImageFile,
  isDownloadableProductImageUrl,
} from "@/features/products/utils/fetch-remote-image-file";

import type { UploadedProductMedia } from "../form/variants/product-add-variant.types";

export type UploadInstagramAiMediaResult = {
  uploadedMedia: UploadedProductMedia[];
  selectedMediaCount: number;
  failedMediaCount: number;
};

const getSelectedExtractionMedia = (
  extraction: InstagramPostAiExtractionResponse,
): InstagramPostAiExtractionResponse["media"] => {
  const selectedIds = new Set(extraction.data.selectedMediaIds);

  if (selectedIds.size === 0) {
    return extraction.media;
  }

  const selected = extraction.media.filter((media) =>
    selectedIds.has(media.mediaId),
  );

  return selected.length > 0 ? selected : extraction.media;
};

export const uploadInstagramAiSelectedMedia = async (
  extraction: InstagramPostAiExtractionResponse,
): Promise<UploadInstagramAiMediaResult> => {
  const selectedMedia = getSelectedExtractionMedia(extraction).filter(
    (media) => media.type.trim().toLowerCase() !== "video",
  );
  const uploadedMedia: UploadedProductMedia[] = [];
  let failedMediaCount = 0;

  for (const media of selectedMedia) {
    if (!isDownloadableProductImageUrl(media.url)) {
      failedMediaCount += 1;
      continue;
    }

    const file = await fetchUrlAsImageFile(
      media.url,
      `instagram-${media.mediaId}`,
    );

    if (!file) {
      failedMediaCount += 1;
      continue;
    }

    try {
      uploadedMedia.push(await productsApi.uploadMedia(file));
    } catch {
      failedMediaCount += 1;
    }
  }

  return {
    uploadedMedia,
    selectedMediaCount: selectedMedia.length,
    failedMediaCount,
  };
};
