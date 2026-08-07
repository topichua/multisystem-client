import { Modal } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ProductsStore } from "@/features/products/model/products-store";
import type {
  ProductType as ApiProductType,
  VariantCustomField,
} from "@/features/products/model/product-create-api.types";
import type { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";
import type { ProductAddFormValues } from "../form/product-form.types";
import {
  normalizeCreateProductPayload,
  normalizeUpdateProductPayload,
} from "../form/payload/normalize-create-product-payload";
import type {
  ProductVariantUi,
  UploadedProductMedia,
} from "../form/variants/product-add-variant.types";
import { findDuplicateVariantKeys } from "../form/variants/product-add-variant.utils";
import {
  validateProductOptionBaselinePreserved,
  type ProductOptionCharacteristicsBaseline,
} from "../form/variants/product-option-baseline";
import type { ProductType } from "../form/sections/product-type-section";

type ProductSubmitMessageApi = {
  error: (config: { title: string }) => void;
  success: (config: { title: string }) => void;
};

type UseProductFormSubmitControllerParams = {
  editingProductId: number | null;
  getProductVariantsWithFormValues: () => ProductVariantUi[];
  isEditMode: boolean;
  notification: ProductSubmitMessageApi;
  navigateToProductsList: () => void;
  productMedia: UploadedProductMedia[];
  productType: ProductType;
  productsStore: ProductsStore;
  optionBaseline: ProductOptionCharacteristicsBaseline;
  variantCustomFields: VariantCustomField[];
  inventoryMode: InventoryMode | null;
};

export function useProductFormSubmitController({
  editingProductId,
  getProductVariantsWithFormValues,
  isEditMode,
  notification,
  navigateToProductsList,
  productMedia,
  productType,
  productsStore,
  optionBaseline,
  variantCustomFields,
  inventoryMode,
}: UseProductFormSubmitControllerParams) {
  const { t } = useTranslation();
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const getProductSubmitErrorMessage = useCallback(
    (error: unknown, fallback: string) => getApiErrorMessage(error, fallback),
    [],
  );

  const submitCreateProduct = useCallback(
    async (
      values: ProductAddFormValues,
      submitProductType: ApiProductType,
      variantsForSubmit: ProductVariantUi[],
      submitInventoryMode: InventoryMode,
    ) => {
      setIsSavingProduct(true);

      try {
        const payload = normalizeCreateProductPayload({
          formValues: values,
          productType: submitProductType,
          productMedia,
          variants: variantsForSubmit,
          inventoryMode: submitInventoryMode,
        });

        if (payload.variants.length === 0) {
          notification.error({
            title: t("products.variantsForm.addAtLeastOne"),
          });
          return;
        }

        await productsStore.createProduct(payload);
        notification.success({ title: t("products.createSuccess") });
        navigateToProductsList();
      } catch (error) {
        notification.error({
          title: getProductSubmitErrorMessage(
            error,
            t("products.createFailed"),
          ),
        });
      } finally {
        setIsSavingProduct(false);
      }
    },
    [
      getProductSubmitErrorMessage,
      notification,
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
      submitInventoryMode: InventoryMode,
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
          inventoryMode: submitInventoryMode,
        });

        if (payload.variants.length === 0) {
          notification.error({
            title: t("products.variantsForm.addAtLeastOne"),
          });
          return;
        }

        if (submitProductType === "variants") {
          const baselineValidation = validateProductOptionBaselinePreserved(
            optionBaseline,
            editingProductId,
            values.characteristics,
            variantsForSubmit,
            variantCustomFields,
          );

          if (!baselineValidation.valid) {
            notification.error({
              title: t("products.variantsForm.lockedOptionsChanged"),
            });
            return;
          }
        }

        await productsStore.updateProduct(editingProductId, payload);
        notification.success({ title: t("products.updateSuccess") });
        navigateToProductsList();
      } catch (error) {
        notification.error({
          title: getProductSubmitErrorMessage(
            error,
            t("products.updateFailed"),
          ),
        });
      } finally {
        setIsSavingProduct(false);
      }
    },
    [
      editingProductId,
      getProductSubmitErrorMessage,
      notification,
      navigateToProductsList,
      optionBaseline,
      productMedia,
      productsStore,
      t,
      variantCustomFields,
    ],
  );

  const handleCreateProductSubmit = useCallback(
    async (values: ProductAddFormValues) => {
      if (!inventoryMode) {
        notification.error({ title: t("system.settingsLoadError") });
        return;
      }

      const variantsForSubmit = getProductVariantsWithFormValues();

      if (productType === "variants" && variantsForSubmit.length === 0) {
        notification.error({ title: t("products.variantsForm.addAtLeastOne") });
        return;
      }

      const duplicateKeys = findDuplicateVariantKeys(variantsForSubmit);
      if (duplicateKeys.size > 0) {
        notification.error({ title: t("products.variantsForm.duplicate") });
        return;
      }

      const manualVariantsWithMissingFields = variantsForSubmit.filter(
        (variant) =>
          variant.source === "manual" &&
          variant.customFields.length > 0 &&
          variant.customFields.some((field) => !field.value.trim()),
      );
      if (manualVariantsWithMissingFields.length > 0) {
        notification.error({
          title: t("products.variantsForm.manualMissingFields"),
        });
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
          onOk: () =>
            submitProduct(values, "single", variantsForSubmit, inventoryMode),
        });
        return;
      }

      if (productType === "single") {
        await submitProduct(
          values,
          "single",
          singleVariantsForSubmit,
          inventoryMode,
        );
        return;
      }

      await submitProduct(
        values,
        productType as ApiProductType,
        variantsForSubmit,
        inventoryMode,
      );
    },
    [
      getProductVariantsWithFormValues,
      inventoryMode,
      isEditMode,
      notification,
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
