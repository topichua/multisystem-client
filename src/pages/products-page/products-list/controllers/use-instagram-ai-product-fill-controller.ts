import type { FormInstance } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";
import type { ProductsStore } from "@/features/products/model/products-store";

import type { ProductAddFormValues } from "../form/product-form.types";
import type { ProductVariantUi } from "../form/variants/product-add-variant.types";
import type { ProductVariantsControllerReturn } from "./use-product-variants-controller";
import { buildInstagramAiProductFormPatch } from "./instagram-ai-product-form-patch";
import { uploadInstagramAiSelectedMedia } from "./upload-instagram-ai-selected-media";
import type { UploadedProductMedia } from "../form/variants/product-add-variant.types";

type CategoryOption = {
  value: number;
  label: string;
};

type ProductInstagramAiMessageApi = {
  error: (config: { title: string }) => void;
  success: (config: { title: string }) => void;
  warning: (config: { title: string }) => void;
};

type InstagramAiVariantsController = Pick<
  ProductVariantsControllerReturn,
  | "setProductType"
  | "setExcludedVariantKeys"
  | "setProductVariants"
  | "syncVariantsToForm"
>;

export type UseInstagramAiProductFillControllerParams = {
  categoryOptions: readonly CategoryOption[];
  form: FormInstance<ProductAddFormValues>;
  loadVariantCustomFields: () => Promise<void>;
  notification: ProductInstagramAiMessageApi;
  productsStore: ProductsStore;
  setProductMedia: (media: UploadedProductMedia[]) => void;
  uploadedProductMedia: UploadedProductMedia[];
  variantsController: InstagramAiVariantsController;
};

export const useInstagramAiProductFillController = ({
  categoryOptions,
  form,
  loadVariantCustomFields,
  notification,
  productsStore,
  setProductMedia,
  uploadedProductMedia,
  variantsController,
}: UseInstagramAiProductFillControllerParams) => {
  const { t } = useTranslation();
  const [isApplyingInstagramAiExtraction, setApplyingInstagramAiExtraction] =
    useState(false);

  const onInstagramAiFill = useCallback(
    async (extraction: InstagramPostAiExtractionResponse) => {
      setApplyingInstagramAiExtraction(true);

      try {
        if (productsStore.variantCustomFields.length === 0) {
          await loadVariantCustomFields();
        }

        const { formValues, productType } = buildInstagramAiProductFormPatch({
          extraction,
          categoryOptions,
          variantCustomFields: productsStore.variantCustomFields,
        });
        const mediaUploadResult =
          await uploadInstagramAiSelectedMedia(extraction);

        variantsController.setProductType(productType);
        variantsController.setExcludedVariantKeys(new Set<string>());
        variantsController.setProductVariants([] as ProductVariantUi[]);
        variantsController.syncVariantsToForm([]);
        form.setFieldsValue(formValues);

        if (mediaUploadResult.uploadedMedia.length > 0) {
          setProductMedia([
            ...uploadedProductMedia,
            ...mediaUploadResult.uploadedMedia,
          ]);
        }

        if (
          mediaUploadResult.selectedMediaCount > 0 &&
          mediaUploadResult.failedMediaCount > 0
        ) {
          notification.warning({
            title: t("products.instagram.ai.fillMediaPartialWarning", {
              count: mediaUploadResult.failedMediaCount,
            }),
          });
        } else {
          notification.success({
            title: t("products.instagram.ai.fillSuccess"),
          });
        }
      } catch (error) {
        notification.error({ title: t("products.instagram.ai.fillError") });
        throw error;
      } finally {
        setApplyingInstagramAiExtraction(false);
      }
    },
    [
      categoryOptions,
      form,
      loadVariantCustomFields,
      notification,
      productsStore,
      setProductMedia,
      t,
      uploadedProductMedia,
      variantsController,
    ],
  );

  return {
    isApplyingInstagramAiExtraction,
    onInstagramAiFill,
  };
};
