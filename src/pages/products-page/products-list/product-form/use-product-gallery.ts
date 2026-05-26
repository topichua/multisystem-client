import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ProductDetails } from "@/features/products/model/product.types";

import { filterProductMediaItems } from "../product-detail/product-detail-media";
import { resolveGalleryPersistPayload } from "../product-edit-persist";
import {
  buildGalleryFromProduct,
  createGalleryItemFromFile,
  resolveActiveCoverId,
  type GalleryItem,
} from "./product-gallery";

type UseProductGalleryParams = {
  isEditMode: boolean;
  product: ProductDetails | null;
  isSaving: boolean;
  onPersistGallery?: (
    coverImage?: File | null,
    galleryImages?: File[],
    coverUrl?: string | null,
    remainingGalleryUrls?: string[],
  ) => Promise<boolean>;
};

export const useProductGallery = ({
  isEditMode,
  product,
  isSaving,
  onPersistGallery,
}: UseProductGalleryParams) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const galleryRef = useRef<GalleryItem[]>([]);
  const coverIdRef = useRef<string | null>(null);
  const galleryDirtyRef = useRef(false);

  const resolvedCoverId = useMemo(
    () => resolveActiveCoverId(gallery, coverId),
    [gallery, coverId],
  );

  useEffect(() => {
    galleryRef.current = gallery;
  }, [gallery]);

  useEffect(() => {
    coverIdRef.current = coverId;
  }, [coverId]);

  const productMediaKey = useMemo(() => {
    if (!product) {
      return "";
    }

    const media = filterProductMediaItems(product)
      .map((item) => `${item.id}:${item.url.trim()}`)
      .join("|");

    return `${product.mainImageUrl ?? ""}|${media}`;
  }, [product]);

  useEffect(() => {
    if (!isEditMode || !product || isSaving || galleryDirtyRef.current) {
      return;
    }

    const items = buildGalleryFromProduct(product);
    setGallery(items);
    setCoverId(items[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- synced via productMediaKey after silent gallery persist.
  }, [isEditMode, isSaving, product?.id, productMediaKey]);

  useEffect(() => {
    return () => {
      galleryRef.current.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const persistGalleryWithState = useCallback(
    async (items: GalleryItem[], activeCoverId: string | null) => {
      if (!isEditMode || !onPersistGallery) {
        return;
      }

      galleryDirtyRef.current = true;

      const { coverFile, coverUrl, galleryImages, remainingGalleryUrls } =
        resolveGalleryPersistPayload(items, activeCoverId);

      try {
        await onPersistGallery(
          coverFile,
          galleryImages,
          coverUrl,
          remainingGalleryUrls,
        );
      } finally {
        galleryDirtyRef.current = false;
      }
    },
    [isEditMode, onPersistGallery],
  );

  const selectCover = useCallback(
    (id: string) => {
      setCoverId(id);
      if (isEditMode) {
        void persistGalleryWithState(galleryRef.current, id);
      }
    },
    [isEditMode, persistGalleryWithState],
  );

  const removeGalleryItem = useCallback(
    (id: string) => {
      setGallery((prev) => {
        const victim = prev.find((item) => item.id === id);
        if (victim?.file) {
          URL.revokeObjectURL(victim.previewUrl);
        }
        const next = prev.filter((item) => item.id !== id);
        const nextCoverId =
          coverIdRef.current === id
            ? (next[0]?.id ?? null)
            : coverIdRef.current;

        if (coverIdRef.current === id) {
          setCoverId(nextCoverId);
        }

        if (isEditMode) {
          void persistGalleryWithState(next, nextCoverId);
        }

        return next;
      });
    },
    [isEditMode, persistGalleryWithState],
  );

  const clearGallery = useCallback(() => {
    setGallery((prev) => {
      prev.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return [];
    });
    setCoverId(null);
    if (isEditMode) {
      void persistGalleryWithState([], null);
    }
  }, [isEditMode, persistGalleryWithState]);

  const addGalleryFile = useCallback(
    (file: File) => {
      const newItem = createGalleryItemFromFile(file);
      setGallery((prev) => {
        const next = [...prev, newItem];
        setCoverId((cover) => {
          const nextCover = cover ?? newItem.id;
          if (isEditMode) {
            void persistGalleryWithState(next, nextCover);
          }
          return nextCover;
        });
        return next;
      });
      return newItem;
    },
    [isEditMode, persistGalleryWithState],
  );

  const replaceGallery = useCallback((items: GalleryItem[]) => {
    setGallery(items);
    setCoverId(items[0]?.id ?? null);
  }, []);

  const resolveCoverAndGalleryFiles = useCallback(() => {
    const coverItem =
      resolvedCoverId != null
        ? gallery.find((item) => item.id === resolvedCoverId)
        : null;
    const coverFile = coverItem?.file ?? null;
    const coverUrl = coverItem?.previewUrl.trim() || null;
    const galleryImages = gallery
      .filter((item) => item.id !== resolvedCoverId && item.file != null)
      .map((item) => item.file as File);
    const remainingGalleryUrls = gallery
      .map((item) => item.previewUrl.trim())
      .filter(Boolean);

    return { coverFile, coverUrl, galleryImages, remainingGalleryUrls };
  }, [gallery, resolvedCoverId]);

  return {
    gallery,
    resolvedCoverId,
    selectCover,
    removeGalleryItem,
    clearGallery,
    addGalleryFile,
    replaceGallery,
    resolveCoverAndGalleryFiles,
  };
};
