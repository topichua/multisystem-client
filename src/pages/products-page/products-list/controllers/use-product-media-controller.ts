import { Upload } from "antd";
import type { UploadProps } from "antd";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { productsApi } from "@/features/products/api/products-api";

import { validateProductImageFile } from "../form/media/product-image-upload";
import type {
  ProductVariantUi,
  UploadedProductMedia,
} from "../form/variants/product-add-variant.types";
import { isProductMediaUsedByVariants } from "../form/variants/product-add-variant.utils";

export type ProductMediaUploadRequestOptions = Parameters<
  NonNullable<UploadProps["customRequest"]>
>[0];

type ProductMediaMessageApi = {
  error: (config: { title: string }) => void;
  warning: (config: { title: string }) => void;
};

type ProductMediaTexts = {
  invalidType: string;
  tooLarge: string;
  uploadFailed: string;
  usedByVariants: string;
};

export type UseProductMediaControllerParams = {
  getProductVariants: () => ProductVariantUi[];
  notification: ProductMediaMessageApi;
  texts: ProductMediaTexts;
};

export type ProductMediaControllerReturn = {
  uploadedProductMedia: UploadedProductMedia[];
  productMediaUploadingCount: number;
  deletingProductMediaId: number | null;
  setProductMedia: (media: UploadedProductMedia[]) => void;
  onBeforeUpload: (file: File) => boolean | typeof Upload.LIST_IGNORE;
  onUpload: (options: ProductMediaUploadRequestOptions) => void;
  onDelete: (mediaId: number) => void;
  onReorder: (activeMediaId: number, overMediaId: number) => void;
};

export function useProductMediaController({
  getProductVariants,
  notification,
  texts,
}: UseProductMediaControllerParams): ProductMediaControllerReturn {
  const [uploadedProductMedia, setUploadedProductMedia] = useState<
    UploadedProductMedia[]
  >([]);
  const [productMediaUploadingCount, setProductMediaUploadingCount] =
    useState(0);
  const [deletingProductMediaId, setDeletingProductMediaId] = useState<
    number | null
  >(null);

  const setProductMedia = useCallback((media: UploadedProductMedia[]) => {
    setUploadedProductMedia(media);
  }, []);

  const onUpload = useCallback(
    async (options: ProductMediaUploadRequestOptions) => {
      const file = options.file as File;
      const validationError = validateProductImageFile(file, {
        invalidType: texts.invalidType,
        tooLarge: texts.tooLarge,
      });

      if (validationError) {
        options.onError?.(new Error(validationError));
        notification.error({ title: validationError });
        return;
      }

      setProductMediaUploadingCount((count) => count + 1);

      try {
        const uploaded = await productsApi.uploadMedia(file);

        setUploadedProductMedia((previous) => [...previous, uploaded]);
        options.onSuccess?.(uploaded);
      } catch (error) {
        options.onError?.(error as Error);
        notification.error({
          title: getApiErrorMessage(error, texts.uploadFailed),
        });
      } finally {
        setProductMediaUploadingCount((count) => Math.max(0, count - 1));
      }
    },
    [notification, texts.invalidType, texts.tooLarge, texts.uploadFailed],
  );

  const onDelete = useCallback(
    (mediaId: number) => {
      const variants = getProductVariants();

      if (isProductMediaUsedByVariants(mediaId, variants)) {
        notification.warning({ title: texts.usedByVariants });
        return;
      }

      setDeletingProductMediaId(mediaId);
      setUploadedProductMedia((previous) =>
        previous.filter((media) => media.id !== mediaId),
      );
      setDeletingProductMediaId((current) =>
        current === mediaId ? null : current,
      );
    },
    [getProductVariants, notification, texts.usedByVariants],
  );

  const onReorder = useCallback(
    (activeMediaId: number, overMediaId: number) => {
      setUploadedProductMedia((current) => {
        const activeIndex = current.findIndex(
          (media) => media.id === activeMediaId,
        );
        const overIndex = current.findIndex(
          (media) => media.id === overMediaId,
        );

        if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
          return current;
        }

        const next = [...current];
        const [moved] = next.splice(activeIndex, 1);
        next.splice(overIndex, 0, moved);
        return next;
      });
    },
    [],
  );

  const onBeforeUpload = useCallback(
    (file: File) => {
      const validationError = validateProductImageFile(file, {
        invalidType: texts.invalidType,
        tooLarge: texts.tooLarge,
      });
      if (validationError) {
        notification.error({ title: validationError });
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    [notification, texts.invalidType, texts.tooLarge],
  );

  return {
    uploadedProductMedia,
    productMediaUploadingCount,
    deletingProductMediaId,
    setProductMedia,
    onBeforeUpload,
    onUpload,
    onDelete,
    onReorder,
  };
}
