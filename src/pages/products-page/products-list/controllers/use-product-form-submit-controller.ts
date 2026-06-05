import { Modal } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ProductsStore } from "@/features/products/model/products-store";
import type { ProductType as ApiProductType } from "@/features/products/model/product-create-api.types";
import type { ProductAddFormValues } from "../form/product-form.types";
import {
  normalizeCreateProductPayload,
  normalizeUpdateProductPayload,
  PRODUCT_CATEGORY_REQUIRED_ERROR,
} from "../form/payload/normalize-create-product-payload";
import type {
  ProductVariantUi,
  UploadedProductMedia,
} from "../form/variants/product-add-variant.types";
import { findDuplicateVariantKeys } from "../form/variants/product-add-variant.utils";
import type { ProductType } from "../form/sections/product-type-section";

type ProductSubmitMessageApi = {
  error: (content: string) => void;
  success: (content: string) => void;
};

type UseProductFormSubmitControllerParams = {
  editingProductId: number | null;
  getProductVariantsWithFormValues: () => ProductVariantUi[];
  isEditMode: boolean;
  messageApi: ProductSubmitMessageApi;
  navigateToProductsList: () => void;
  productMedia: UploadedProductMedia[];
  productType: ProductType;
  productsStore: ProductsStore;
};

export function useProductFormSubmitController({
  editingProductId,
  getProductVariantsWithFormValues,
  isEditMode,
  messageApi,
  navigateToProductsList,
  productMedia,
  productType,
  productsStore,
}: UseProductFormSubmitControllerParams) {
  const { t } = useTranslation();
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const getProductSubmitErrorMessage = useCallback(
    (error: unknown, fallback: string) =>
      error instanceof Error &&
      error.message === PRODUCT_CATEGORY_REQUIRED_ERROR
        ? t("products.categoryRequired")
        : getApiErrorMessage(error, fallback),
    [t],
  );

  const submitCreateProduct = useCallback(
    async (
      values: ProductAddFormValues,
      submitProductType: ApiProductType,
      variantsForSubmit: ProductVariantUi[],
    ) => {
      setIsSavingProduct(true);

      try {
        const payload = normalizeCreateProductPayload({
          formValues: values,
          productType: submitProductType,
          productMedia,
          variants: variantsForSubmit,
        });

        if (payload.variants.length === 0) {
          messageApi.error(t("products.variantsForm.addAtLeastOne"));
          return;
        }

        await productsStore.createProduct(payload);
        messageApi.success(t("products.createSuccess"));
        navigateToProductsList();
      } catch (error) {
        messageApi.error(
          getProductSubmitErrorMessage(error, t("products.createFailed")),
        );
      } finally {
        setIsSavingProduct(false);
      }
    },
    [
      getProductSubmitErrorMessage,
      messageApi,
      navigateToProductsList,
      productMedia,
      productsStore,
      t,
    ],
  );

  const submitUpdateProduct = useCallback(
    async (
      values: ProductAddFormValues,
      submitProductType: ApiProductType,
      variantsForSubmit: ProductVariantUi[],
    ) => {
      if (!editingProductId) {
        return;
      }

      setIsSavingProduct(true);

      try {
        const payload = normalizeUpdateProductPayload({
          formValues: values,
          productType: submitProductType,
          productMedia,
          variants: variantsForSubmit,
        });

        if (payload.variants.length === 0) {
          messageApi.error(t("products.variantsForm.addAtLeastOne"));
          return;
        }

        await productsStore.updateProduct(editingProductId, payload);
        messageApi.success(t("products.updateSuccess"));
        navigateToProductsList();
      } catch (error) {
        messageApi.error(
          getProductSubmitErrorMessage(error, t("products.updateFailed")),
        );
      } finally {
        setIsSavingProduct(false);
      }
    },
    [
      editingProductId,
      getProductSubmitErrorMessage,
      messageApi,
      navigateToProductsList,
      productMedia,
      productsStore,
      t,
    ],
  );

  const handleCreateProductSubmit = useCallback(
    async (values: ProductAddFormValues) => {
      const variantsForSubmit = getProductVariantsWithFormValues();

      if (productType === "variants" && variantsForSubmit.length === 0) {
        messageApi.error(t("products.variantsForm.addAtLeastOne"));
        return;
      }

      const duplicateKeys = findDuplicateVariantKeys(variantsForSubmit);
      if (duplicateKeys.size > 0) {
        messageApi.error(t("products.variantsForm.duplicate"));
        return;
      }

      const manualVariantsWithMissingFields = variantsForSubmit.filter(
        (variant) =>
          variant.source === "manual" &&
          variant.customFields.length > 0 &&
          variant.customFields.some((field) => !field.value.trim()),
      );
      if (manualVariantsWithMissingFields.length > 0) {
        messageApi.error(t("products.variantsForm.manualMissingFields"));
        return;
      }

      const submitProduct = isEditMode
        ? submitUpdateProduct
        : submitCreateProduct;
      const singleVariantsForSubmit =
        isEditMode && variantsForSubmit.length > 0 ? variantsForSubmit : [];

      if (productType === "variants" && variantsForSubmit.length === 1) {
        Modal.confirm({
          content: t(
            isEditMode
              ? "products.variantsForm.singleUpdateConfirm"
              : "products.variantsForm.singleConfirm",
          ),
          okText: t(
            isEditMode ? "products.saveChanges" : "products.modalCreateOk",
          ),
          cancelText: t("products.cancelEdit"),
          onOk: () => submitProduct(values, "single", variantsForSubmit),
        });
        return;
      }

      if (productType === "single") {
        await submitProduct(values, "single", singleVariantsForSubmit);
        return;
      }

      await submitProduct(
        values,
        productType as ApiProductType,
        variantsForSubmit,
      );
    },
    [
      getProductVariantsWithFormValues,
      isEditMode,
      messageApi,
      productType,
      submitCreateProduct,
      submitUpdateProduct,
      t,
    ],
  );

  return {
    isSavingProduct,
    onSubmit: handleCreateProductSubmit,
  };
}
