import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { productsApi } from "@/features/products/api/products-api";

import type {
  ProductVariantUi,
  UploadedProductMedia,
  VariantMediaItem,
} from "../form/variants/product-add-variant.types";

export type ProductVariantImagesModalControllerProps = {
  open: boolean;
  variant: ProductVariantUi | null;
  productMedia: UploadedProductMedia[];
  onClose: () => void;
  onApply: (variantKey: string, media: VariantMediaItem[]) => void;
  onUploadVariantImage: (file: File) => Promise<VariantMediaItem>;
  onRemoveVariantImage: (media: VariantMediaItem) => Promise<void>;
};

export type UseProductVariantImagesControllerParams = {
  productMedia: UploadedProductMedia[];
  getProductVariants: () => ProductVariantUi[];
  mergeVariantsWithFormValues: (
    variants: ProductVariantUi[],
  ) => ProductVariantUi[];
  setProductVariants: Dispatch<SetStateAction<ProductVariantUi[]>>;
  syncVariantsToForm: (variants: ProductVariantUi[]) => void;
};

export type ProductVariantImagesControllerReturn = {
  variantImagesModalProps: ProductVariantImagesModalControllerProps;
  onManageVariantImages: (variant: ProductVariantUi) => void;
};

export function useProductVariantImagesController({
  productMedia,
  getProductVariants,
  mergeVariantsWithFormValues,
  setProductVariants,
  syncVariantsToForm,
}: UseProductVariantImagesControllerParams): ProductVariantImagesControllerReturn {
  const [variantImagesModalVariant, setVariantImagesModalVariant] =
    useState<ProductVariantUi | null>(null);

  const onManageVariantImages = useCallback(
    (variant: ProductVariantUi) => {
      const mergedVariants = getProductVariants();
      const latestVariant =
        mergedVariants.find((item) => item.key === variant.key) ?? variant;

      setVariantImagesModalVariant(latestVariant);
    },
    [getProductVariants],
  );

  const onApplyVariantImages = useCallback(
    (variantKey: string, media: VariantMediaItem[]) => {
      setProductVariants((current) => {
        const mergedVariants = mergeVariantsWithFormValues(current);
        const nextVariants = mergedVariants.map((item) =>
          item.key === variantKey ? { ...item, media } : item,
        );

        syncVariantsToForm(nextVariants);
        return nextVariants;
      });
    },
    [mergeVariantsWithFormValues, setProductVariants, syncVariantsToForm],
  );

  const onUploadVariantOnlyImage = useCallback(async (file: File) => {
    const uploaded = await productsApi.uploadMedia(file);

    return {
      id: uploaded.id,
      src: uploaded.src,
      origin: "variant" as const,
    };
  }, []);

  const onRemoveVariantOnlyImage = useCallback(async () => {}, []);

  const onCloseVariantImagesModal = useCallback(() => {
    setVariantImagesModalVariant(null);
  }, []);

  return {
    onManageVariantImages,
    variantImagesModalProps: {
      open: variantImagesModalVariant != null,
      variant: variantImagesModalVariant,
      productMedia,
      onClose: onCloseVariantImagesModal,
      onApply: onApplyVariantImages,
      onUploadVariantImage: onUploadVariantOnlyImage,
      onRemoveVariantImage: onRemoveVariantOnlyImage,
    },
  };
}
