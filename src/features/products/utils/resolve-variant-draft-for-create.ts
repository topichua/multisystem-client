import type {
  ProductVariantCreatePayload,
  ProductVariantDraft,
} from "@/features/products/model/product.types";

export type GalleryItemForVariantResolve = {
  previewUrl: string;
  file?: File;
};

const isBlobUrl = (url: string): boolean => url.startsWith("blob:");

export const canUseVariantImageUrlForMedia = (url: string): boolean => {
  const trimmed = url.trim();
  return trimmed.length > 0 && !isBlobUrl(trimmed);
};

export const resolveVariantDraftForCreate = (
  draft: ProductVariantDraft,
  gallery: GalleryItemForVariantResolve[] = [],
): { payload: ProductVariantCreatePayload; imageFile: File | null } => {
  const { imageFile: draftImageFile, imageUrl, ...rest } = draft;

  let imageFile = draftImageFile ?? null;
  const trimmedUrl = (imageUrl ?? "").trim();

  if (!imageFile && trimmedUrl) {
    const galleryMatch = gallery.find(
      (item) => item.previewUrl.trim() === trimmedUrl,
    );
    if (galleryMatch?.file) {
      imageFile = galleryMatch.file;
    }
  }

  const resolvedImageUrl =
    !imageFile && canUseVariantImageUrlForMedia(trimmedUrl) ? trimmedUrl : "";

  return {
    payload: {
      ...rest,
      imageUrl: resolvedImageUrl,
    },
    imageFile,
  };
};
