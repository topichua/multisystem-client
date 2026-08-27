import type { FormInstance } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ProductsStore } from "@/features/products/model/products-store";
import { isArchivedStatus } from "@/features/products/utils/product-display";
import { throwLoadError } from "@/utils/throw-load-error";
import { productDetailToProductForm } from "../form/payload/product-detail-to-product-form";
import type { ProductType } from "../form/sections/product-type-section";
import type { ProductAddFormValues } from "../form/product-form.types";
import type {
  ProductVariantUi,
  UploadedProductMedia,
} from "../form/variants/product-add-variant.types";
import {
  buildProductOptionCharacteristicsBaseline,
  EMPTY_PRODUCT_OPTION_BASELINE,
  type ProductOptionCharacteristicsBaseline,
} from "../form/variants/product-option-baseline";
import { syncProductVariantsToForm } from "../form/variants/product-add-variant.utils";

type ProductEditBootstrapMessageApi = {
  error: (config: { title: string }) => void;
};

type UseProductEditBootstrapParams = {
  editingProductId: number | null;
  form: FormInstance<ProductAddFormValues>;
  notification: ProductEditBootstrapMessageApi;
  navigateToProductsList: () => void;
  productsStore: ProductsStore;
  setProductType: (productType: ProductType) => void;
  setProductMedia: (media: UploadedProductMedia[]) => void;
  setProductVariants: (variants: ProductVariantUi[]) => void;
  setExcludedVariantKeys: (keys: Set<string>) => void;
  setApplyingInitialEditValues: () => void;
  setLoadedOptionBaseline: (
    baseline: ProductOptionCharacteristicsBaseline,
  ) => void;
  resetLoadedOptionBaseline: () => void;
};

type UseProductEditBootstrapResult = {
  isInitialEditLoading: boolean;
  editInitialValues: ProductAddFormValues | null;
};

export function useProductEditBootstrap({
  editingProductId,
  form,
  notification,
  navigateToProductsList,
  productsStore,
  setProductType,
  setProductMedia,
  setProductVariants,
  setExcludedVariantKeys,
  setApplyingInitialEditValues,
  setLoadedOptionBaseline,
  resetLoadedOptionBaseline,
}: UseProductEditBootstrapParams): UseProductEditBootstrapResult {
  const { t } = useTranslation();
  const [isInitialEditLoading, setIsInitialEditLoading] = useState(
    editingProductId != null,
  );
  const [editInitialValues, setEditInitialValues] =
    useState<ProductAddFormValues | null>(null);
  const [editInitialValuesProductId, setEditInitialValuesProductId] = useState<
    number | null
  >(editingProductId);

  // Reset hydrated form values during render when the product id changes so we
  // don't call setState synchronously inside the bootstrap effect.
  if (editInitialValuesProductId !== editingProductId) {
    setEditInitialValuesProductId(editingProductId);
    setEditInitialValues(null);
  }

  useEffect(() => {
    if (!editingProductId) {
      productsStore.clearActiveProduct();
      resetLoadedOptionBaseline();
      return;
    }

    let alive = true;

    void (async () => {
      setIsInitialEditLoading(true);
      setApplyingInitialEditValues();
      resetLoadedOptionBaseline();

      try {
        const product = await productsStore.loadProductById(editingProductId);

        if (!alive) {
          return;
        }

        if (isArchivedStatus(product.status)) {
          notification.error({
            title: t("products.archivedCannotEdit"),
          });
          navigateToProductsList();
          return;
        }

        const detailFormState = productDetailToProductForm(product);
        const optionBaseline =
          detailFormState.productType === "variants"
            ? buildProductOptionCharacteristicsBaseline(
                editingProductId,
                detailFormState.variants,
              )
            : EMPTY_PRODUCT_OPTION_BASELINE;

        setApplyingInitialEditValues();
        setProductType(detailFormState.productType);
        setProductMedia(detailFormState.productMedia);
        setProductVariants(detailFormState.variants);
        setExcludedVariantKeys(new Set(detailFormState.excludedVariantKeys));
        setLoadedOptionBaseline(optionBaseline);
        setEditInitialValues(detailFormState.formValues);
        form.setFieldsValue(detailFormState.formValues);
        syncProductVariantsToForm(form, detailFormState.variants);
      } catch (error) {
        if (!alive) {
          return;
        }

        resetLoadedOptionBaseline();
        setEditInitialValues(null);
        notification.error({
          title: getApiErrorMessage(error, t("products.detailLoadFailed")),
        });
        navigateToProductsList();
        throwLoadError(`Failed to load product ${editingProductId}`, error);
      } finally {
        if (alive) {
          setIsInitialEditLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    editingProductId,
    form,
    notification,
    navigateToProductsList,
    productsStore,
    setApplyingInitialEditValues,
    setExcludedVariantKeys,
    setProductMedia,
    setProductType,
    setProductVariants,
    setLoadedOptionBaseline,
    resetLoadedOptionBaseline,
    t,
  ]);

  return { isInitialEditLoading, editInitialValues };
}
