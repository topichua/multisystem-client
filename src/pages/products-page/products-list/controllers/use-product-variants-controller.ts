import { Form, Modal } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { VariantCustomField } from "@/features/products/model/product-create-api.types";
import type { ProductType } from "../form/sections/product-type-section";
import type {
  ProductAddCharacteristicRow,
  ProductAddFormValues,
  ProductAddSingleCharacteristicRow,
} from "../form/product-form.types";
import { generateProductVariantsFromCharacteristics } from "../form/variants/generate-product-variants";
import type { ProductVariantUi } from "../form/variants/product-add-variant.types";
import {
  EMPTY_PRODUCT_OPTION_BASELINE,
  isProductOptionBaselineActiveForProduct,
  type ProductOptionCharacteristicsBaseline,
} from "../form/variants/product-option-baseline";
import {
  createManualVariant,
  filterManualVariants,
  getCharacteristicValueOptions as buildCharacteristicValueOptions,
  hasMeaningfulVariantUserData,
  mergeProductVariantsWithFormValues,
  normalizeSelectedCharacteristics,
  syncManualVariantCustomFields,
  syncProductVariantsToForm,
  updateManualVariantCustomField,
} from "../form/variants/product-add-variant.utils";

type ProductVariantsMessageApi = {
  error: (config: { title: string }) => void;
  warning: (config: { title: string }) => void;
};

export type ProductVariantsControllerParams = {
  form: FormInstance<ProductAddFormValues>;
  editingProductId: number | null;
  isEditMode: boolean;
  notification: ProductVariantsMessageApi;
  variantCustomFields: VariantCustomField[];
  isVariantCustomFieldsLoading: boolean;
};

export function useProductVariantsController({
  form,
  editingProductId,
  isEditMode,
  notification,
  variantCustomFields,
  isVariantCustomFieldsLoading,
}: ProductVariantsControllerParams) {
  const { t } = useTranslation();
  const [productType, setProductType] = useState<ProductType>("single");
  const [productVariants, setProductVariants] = useState<ProductVariantUi[]>(
    [],
  );
  const [excludedVariantKeys, setExcludedVariantKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [deletingVariantKey, setDeletingVariantKey] = useState<string | null>(
    null,
  );
  const [optionBaseline, setOptionBaseline] =
    useState<ProductOptionCharacteristicsBaseline>(
      EMPTY_PRODUCT_OPTION_BASELINE,
    );

  const productVariantsRef = useRef(productVariants);
  const excludedVariantKeysRef = useRef(excludedVariantKeys);
  const applyingInitialEditValuesRef = useRef(false);

  useEffect(() => {
    productVariantsRef.current = productVariants;
  }, [productVariants]);

  useEffect(() => {
    excludedVariantKeysRef.current = excludedVariantKeys;
  }, [excludedVariantKeys]);

  const mergeVariantsWithFormValues = useCallback(
    (variants: ProductVariantUi[]) =>
      mergeProductVariantsWithFormValues(
        variants,
        form.getFieldValue("variants"),
      ),
    [form],
  );

  const getProductVariantsWithFormValues = useCallback(
    () => mergeVariantsWithFormValues(productVariantsRef.current),
    [mergeVariantsWithFormValues],
  );

  const syncVariantsToForm = useCallback(
    (variants: ProductVariantUi[]) => {
      syncProductVariantsToForm(form, variants);
    },
    [form],
  );

  const setApplyingInitialEditValues = useCallback(() => {
    applyingInitialEditValuesRef.current = true;
  }, []);

  const setLoadedOptionBaseline = useCallback(
    (baseline: ProductOptionCharacteristicsBaseline) => {
      setOptionBaseline(baseline);
    },
    [],
  );

  const resetLoadedOptionBaseline = useCallback(() => {
    setOptionBaseline(EMPTY_PRODUCT_OPTION_BASELINE);
  }, []);

  const watchedCharacteristics = Form.useWatch("characteristics", form) as
    ProductAddCharacteristicRow[] | undefined;
  const watchedSingleCharacteristics = Form.useWatch(
    "singleCharacteristics",
    form,
  ) as ProductAddSingleCharacteristicRow[] | undefined;
  const watchedPrice = Form.useWatch("price", form);
  const watchedQuantity = Form.useWatch("quantity", form);
  const watchedStatus = Form.useWatch("status", form);

  const characteristicsSignature = useMemo(
    () =>
      JSON.stringify(
        normalizeSelectedCharacteristics(
          watchedCharacteristics,
          variantCustomFields,
        ),
      ),
    [variantCustomFields, watchedCharacteristics],
  );

  const variantCustomFieldsKey = useMemo(
    () => variantCustomFields.map((field) => field.id).join(","),
    [variantCustomFields],
  );

  const hasCharacteristicsAdded =
    Array.isArray(watchedCharacteristics) && watchedCharacteristics.length > 0;

  const selectedCharacteristics = useMemo(
    () =>
      normalizeSelectedCharacteristics(
        watchedCharacteristics,
        variantCustomFields,
      ),
    [variantCustomFields, watchedCharacteristics],
  );

  useEffect(() => {
    if (productType !== "variants") {
      return;
    }
    if (applyingInitialEditValuesRef.current) {
      applyingInitialEditValuesRef.current = false;
      return;
    }
    if (
      Array.isArray(watchedCharacteristics) &&
      watchedCharacteristics.length > 0 &&
      variantCustomFields.length === 0
    ) {
      return;
    }

    const previousVariants = mergeProductVariantsWithFormValues(
      productVariantsRef.current,
      form.getFieldValue("variants"),
    );
    const normalizedCharacteristics = normalizeSelectedCharacteristics(
      watchedCharacteristics,
      variantCustomFields,
    );
    const manualVariants = filterManualVariants(previousVariants).map(
      (variant) =>
        syncManualVariantCustomFields(variant, normalizedCharacteristics),
    );
    const currentExcludedKeys = excludedVariantKeysRef.current;

    const allGeneratedVariants = generateProductVariantsFromCharacteristics({
      selectedCharacteristics: normalizedCharacteristics,
      base: {
        price: Number(watchedPrice ?? 0),
        quantity: Number(watchedQuantity ?? 0),
        status: watchedStatus ?? "active",
      },
      previousVariants,
    });

    const filteredGeneratedVariants = allGeneratedVariants.filter(
      (variant) => !currentExcludedKeys.has(variant.key),
    );

    const nextVariants = [...filteredGeneratedVariants, ...manualVariants];

    setProductVariants(nextVariants);
    syncProductVariantsToForm(form, nextVariants);
    // characteristicsSignature tracks watchedCharacteristics.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- watchedCharacteristics
  }, [
    characteristicsSignature,
    form,
    productType,
    variantCustomFields,
    variantCustomFieldsKey,
    watchedPrice,
    watchedQuantity,
    watchedStatus,
  ]);

  const getCharacteristicValueOptions = useCallback(
    (attributeId?: number): Array<{ value: string; label: string }> =>
      buildCharacteristicValueOptions(attributeId, variantCustomFields),
    [variantCustomFields],
  );

  const handleProductTypeChange = useCallback(
    (nextType: ProductType) => {
      if (nextType === productType) {
        return;
      }

      if (nextType === "single") {
        const variantsWithForm = mergeProductVariantsWithFormValues(
          productVariantsRef.current,
          form.getFieldValue("variants"),
        );

        const switchToSingle = () => {
          const firstVariant = variantsWithForm[0];
          const singleCharacteristics =
            firstVariant?.customFields.map((field) => ({
              field: field.field,
              attributeId:
                field.field?.kind === "existing" ? field.field.id : undefined,
              value: field.value,
            })) ?? [];

          setProductType("single");
          setProductVariants(firstVariant ? [firstVariant] : []);
          setExcludedVariantKeys(new Set());
          form.setFieldValue("characteristics", []);
          form.setFieldValue("variants", []);
          form.setFieldValue("singleCharacteristics", singleCharacteristics);
        };

        if (isEditMode && variantsWithForm.length > 0) {
          Modal.confirm({
            title: t("products.productType.switchToSingleConfirmTitle"),
            content: t("products.productType.switchToSingleConfirmText"),
            okText: t("products.productType.switchToSingleConfirmOk"),
            cancelText: t("products.cancelEdit"),
            onOk: switchToSingle,
          });
          return;
        }

        if (
          hasCharacteristicsAdded ||
          hasMeaningfulVariantUserData(variantsWithForm)
        ) {
          notification.warning({
            title: t("products.productType.switchToSingleBlocked"),
          });
          return;
        }

        switchToSingle();
        return;
      }

      setProductType("variants");
      form.setFieldValue("singleCharacteristics", []);
    },
    [form, hasCharacteristicsAdded, isEditMode, notification, productType, t],
  );

  const handleDeleteVariant = useCallback(
    async (variant: ProductVariantUi) => {
      setDeletingVariantKey(variant.key);

      try {
        if (variant.source === "generated") {
          setExcludedVariantKeys((current) => {
            const next = new Set(current);
            next.add(variant.key);
            return next;
          });
        }

        setProductVariants((current) => {
          const mergedVariants = mergeProductVariantsWithFormValues(
            current,
            form.getFieldValue("variants"),
          );
          const nextVariants = mergedVariants.filter(
            (item) => item.key !== variant.key,
          );

          syncProductVariantsToForm(form, nextVariants);
          return nextVariants;
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("products.variantDeleteFailed")),
        });
      } finally {
        setDeletingVariantKey(null);
      }
    },
    [form, notification, t],
  );

  const removeVariantById = useCallback(
    (variantId: number) => {
      setProductVariants((current) => {
        const mergedVariants = mergeProductVariantsWithFormValues(
          current,
          form.getFieldValue("variants"),
        );
        const nextVariants = mergedVariants.filter(
          (item) => item.id !== variantId,
        );

        syncProductVariantsToForm(form, nextVariants);
        return nextVariants;
      });
    },
    [form],
  );

  const setVariantStatusById = useCallback(
    (variantId: number, status: ProductVariantUi["status"]) => {
      setProductVariants((current) => {
        const mergedVariants = mergeProductVariantsWithFormValues(
          current,
          form.getFieldValue("variants"),
        );
        const nextVariants = mergedVariants.map((item) =>
          item.id === variantId ? { ...item, status } : item,
        );

        syncProductVariantsToForm(form, nextVariants);
        return nextVariants;
      });
    },
    [form],
  );

  const applyVariantStockFromInventory = useCallback(
    (inventory: {
      variants?: Array<{
        variantId: number;
        quantity?: number | null;
        availableQuantity?: number | null;
        stockQty?: number | null;
      }> | null;
    }) => {
      const quantityByVariantId = new Map<number, number>();

      for (const variant of inventory.variants ?? []) {
        const quantity = Number(
          variant.quantity ??
            variant.availableQuantity ??
            variant.stockQty ??
            0,
        );
        quantityByVariantId.set(variant.variantId, quantity);
      }

      if (quantityByVariantId.size === 0) {
        return;
      }

      setProductVariants((current) => {
        const mergedVariants = mergeProductVariantsWithFormValues(
          current,
          form.getFieldValue("variants"),
        );

        const nextVariants = mergedVariants.map((item) => {
          if (item.id == null || !quantityByVariantId.has(item.id)) {
            return item;
          }

          const nextQuantity = quantityByVariantId.get(item.id) ?? 0;

          return {
            ...item,
            quantity: nextQuantity,
            inStock: nextQuantity > 0,
          };
        });

        syncProductVariantsToForm(form, nextVariants);
        productVariantsRef.current = nextVariants;
        return nextVariants;
      });
    },
    [form],
  );

  const handleAddManualVariant = useCallback(() => {
    const mergedVariants = mergeProductVariantsWithFormValues(
      productVariantsRef.current,
      form.getFieldValue("variants"),
    );

    const manualVariant = createManualVariant({
      price: Number(watchedPrice ?? 0),
      quantity: Number(watchedQuantity ?? 0),
      status: watchedStatus ?? "active",
      selectedCharacteristics: normalizeSelectedCharacteristics(
        watchedCharacteristics,
        variantCustomFields,
      ),
    });

    const nextVariants = [...mergedVariants, manualVariant];
    setProductVariants(nextVariants);
    syncProductVariantsToForm(form, nextVariants);
  }, [
    form,
    variantCustomFields,
    watchedCharacteristics,
    watchedPrice,
    watchedQuantity,
    watchedStatus,
  ]);

  const handleUpdateManualVariantCustomField = useCallback(
    (variantKey: string, fieldStableKey: string, value: string) => {
      setProductVariants((current) => {
        const mergedVariants = mergeProductVariantsWithFormValues(
          current,
          form.getFieldValue("variants"),
        );

        const nextVariants = mergedVariants.map((variant) => {
          if (variant.key !== variantKey || variant.source !== "manual") {
            return variant;
          }

          return updateManualVariantCustomField(variant, fieldStableKey, value);
        });

        syncProductVariantsToForm(form, nextVariants);
        return nextVariants;
      });
    },
    [form],
  );

  const handleApplyPriceToAllVariants = useCallback(
    (price: number) => {
      const mergedVariants = mergeProductVariantsWithFormValues(
        productVariantsRef.current,
        form.getFieldValue("variants"),
      );

      if (mergedVariants.length === 0) {
        return;
      }

      const nextVariants = mergedVariants.map((variant) => ({
        ...variant,
        price,
      }));

      setProductVariants(nextVariants);
      syncProductVariantsToForm(form, nextVariants);
      form.setFieldValue("price", price);
    },
    [form],
  );

  return {
    productType,
    productVariants,
    setProductType,
    setProductVariants,
    setExcludedVariantKeys,
    setApplyingInitialEditValues,
    setLoadedOptionBaseline,
    resetLoadedOptionBaseline,
    mergeVariantsWithFormValues,
    getProductVariantsWithFormValues,
    syncVariantsToForm,
    watchedCharacteristics,
    watchedSingleCharacteristics,
    selectedCharacteristics,
    optionBaseline,
    optionEditRestrictionsActive:
      productType === "variants" &&
      isEditMode &&
      isProductOptionBaselineActiveForProduct(optionBaseline, editingProductId),
    isVariantCustomFieldsLoading,
    getCharacteristicValueOptions,
    deletingVariantKey,
    onProductTypeChange: handleProductTypeChange,
    onDeleteVariant: handleDeleteVariant,
    removeVariantById,
    setVariantStatusById,
    applyVariantStockFromInventory,
    onAddManualVariant: handleAddManualVariant,
    onUpdateManualVariantCustomField: handleUpdateManualVariantCustomField,
    onApplyPriceToAllVariants: handleApplyPriceToAllVariants,
  };
}

export type ProductVariantsControllerReturn = ReturnType<
  typeof useProductVariantsController
>;
