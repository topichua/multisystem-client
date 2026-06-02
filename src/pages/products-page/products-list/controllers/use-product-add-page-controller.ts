import { Form, message, Modal } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ProductType as ApiProductType } from "@/features/products/model/product-create-api.types";
import {
  defaultCreateValues,
  type ProductCreateFormValues,
} from "../form/product-form.types";
import {
  normalizeCreateProductPayload,
  normalizeUpdateProductPayload,
} from "../form/payload/normalize-create-product-payload";
import { productDetailToProductForm } from "../form/payload/product-detail-to-product-form";
import type {
  ProductCharacteristicFormRow,
  ProductVariantUi,
  SingleProductCharacteristicFormRow,
} from "../form/variants/product-add-variant.types";
import { generateProductVariantsFromCharacteristics } from "../form/variants/generate-product-variants";
import {
  createManualVariant,
  filterManualVariants,
  findDuplicateVariantKeys,
  hasMeaningfulVariantUserData,
  mergeProductVariantsWithFormValues,
  getCharacteristicValueOptions as buildCharacteristicValueOptions,
  mapCharacteristicFieldSelectOptions,
  normalizeSelectedCharacteristics,
  normalizeSingleCharacteristics,
  sortVariantCustomFields,
  syncManualVariantCustomFields,
  syncProductVariantsToForm,
  updateManualVariantCustomField,
} from "../form/variants/product-add-variant.utils";
import { useProductAddVariantTableColumns } from "../form/variants/use-product-add-variant-table-columns";
import { useProductsListController } from "./use-products-list-controller";
import type { ProductType } from "../form/sections/product-type-section";
import {
  useProductMediaController,
  type ProductMediaControllerReturn,
} from "./use-product-media-controller";
import {
  useProductVariantImagesController,
  type ProductVariantImagesModalControllerProps,
} from "./use-product-variant-images-controller";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CharacteristicRow = ProductCharacteristicFormRow & {
  attributeId?: number;
};

type SingleCharacteristicRow = SingleProductCharacteristicFormRow & {
  attributeId?: number;
};

export type ProductAddFormValues = ProductCreateFormValues & {
  characteristics: CharacteristicRow[];
  singleCharacteristics: SingleCharacteristicRow[];
  variants: unknown[];
};

export type ProductAddPageControllerReturn = {
  // Context holder for message API
  contextHolder: React.ReactElement;
  pageLoading: boolean;

  // Form
  form: FormInstance<ProductAddFormValues>;
  initialValues: ProductAddFormValues;

  // Page meta
  title: string;
  subtitle: string;
  backLabel: string;
  navigateToProductsList: () => void;

  // Product type section
  productType: ProductType;
  onProductTypeChange: (nextType: ProductType) => void;

  // Main info section
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    status: string;
  };

  // Single characteristics section
  singleCharacteristicsProps: {
    watchedSingleCharacteristics: SingleCharacteristicRow[] | undefined;
    variantCustomFields: ReturnType<
      typeof useProductsListController
    >["variantCustomFields"];
    isVariantCustomFieldsLoading: boolean;
    getSingleCharacteristicFieldOptionsForRow: (
      currentAttributeId?: number,
    ) => Array<{ value: number; label: string; disabled?: boolean }>;
    getCharacteristicValueOptions: (
      attributeId?: number,
    ) => Array<{ value: string; label: string }>;
  };

  // Media section
  mediaProps: Omit<ProductMediaControllerReturn, "setProductMedia"> & {
    texts: {
      title: string;
      subtitle: string;
      dragUploadTitle: string;
      mainImageLabel: string;
      deleteTooltip: string;
      uploadHint: string;
      reorderHint: string;
    };
  };

  // Variants section
  variantsProps: {
    productVariants: ProductVariantUi[];
    variantTableColumns: ReturnType<typeof useProductAddVariantTableColumns>;
    watchedCharacteristics: CharacteristicRow[] | undefined;
    variantCustomFields: ReturnType<
      typeof useProductsListController
    >["variantCustomFields"];
    isVariantCustomFieldsLoading: boolean;
    getCharacteristicFieldOptionsForRow: (
      currentAttributeId?: number,
    ) => Array<{ value: number; label: string; disabled?: boolean }>;
    getCharacteristicValueOptions: (
      attributeId?: number,
    ) => Array<{ value: string; label: string }>;
    onAddManualVariant: () => void;
  };

  // Submit button
  submitButtonProps: {
    loading: boolean;
    disabled: boolean;
    label: string;
    icon: "create" | "save";
  };

  // Variant images modal
  variantImagesModalProps: ProductVariantImagesModalControllerProps;

  // Submit handler
  onSubmit: (values: ProductAddFormValues) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useProductAddPageController =
  (): ProductAddPageControllerReturn => {
    // ─────────────────────────────────────────────────────────────────────────
    // External hooks
    // ─────────────────────────────────────────────────────────────────────────

    const {
      categoryOptions,
      navigateToProductsList,
      productsStore,
      variantCustomFields,
      isVariantCustomFieldsLoading,
      loadVariantCustomFields,
    } = useProductsListController();
    const { t } = useTranslation();
    const { productId } = useParams();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm<ProductAddFormValues>();
    const parsedProductId = productId ? Number(productId) : null;
    const editingProductId =
      parsedProductId != null && Number.isFinite(parsedProductId)
        ? parsedProductId
        : null;
    const isEditMode = editingProductId != null;

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    const [productType, setProductType] = useState<ProductType>("single");
    const [productVariants, setProductVariants] = useState<ProductVariantUi[]>(
      [],
    );
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [isInitialEditLoading, setIsInitialEditLoading] =
      useState(isEditMode);
    const [excludedVariantKeys, setExcludedVariantKeys] = useState<Set<string>>(
      () => new Set(),
    );
    const [deletingVariantKey, setDeletingVariantKey] = useState<string | null>(
      null,
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Refs (synced via effect to avoid lint errors)
    // ─────────────────────────────────────────────────────────────────────────

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

    const {
      uploadedProductMedia,
      productMediaUploadingCount,
      deletingProductMediaId,
      setProductMedia,
      onBeforeUpload: handleProductImageBeforeUpload,
      onUpload: handleProductMediaUpload,
      onDelete: handleDeleteUploadedProductMedia,
      onReorder: handleReorderProductMedia,
    } = useProductMediaController({
      getProductVariants: getProductVariantsWithFormValues,
      messageApi,
      texts: {
        invalidType: t("products.media.invalidType"),
        tooLarge: t("products.media.tooLarge"),
        uploadFailed: t("products.media.uploadFailed"),
        usedByVariants: t("products.media.usedByVariants"),
      },
    });

    const {
      variantImagesModalProps,
      onManageVariantImages: handleManageVariantImages,
    } = useProductVariantImagesController({
      productMedia: uploadedProductMedia,
      getProductVariants: getProductVariantsWithFormValues,
      mergeVariantsWithFormValues,
      setProductVariants,
      syncVariantsToForm,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Form watch values
    // ─────────────────────────────────────────────────────────────────────────

    const watchedCharacteristics = Form.useWatch("characteristics", form);
    const watchedSingleCharacteristics = Form.useWatch(
      "singleCharacteristics",
      form,
    );
    const watchedPrice = Form.useWatch("price", form);
    const watchedQuantity = Form.useWatch("quantity", form);
    const watchedStatus = Form.useWatch("status", form);

    // ─────────────────────────────────────────────────────────────────────────
    // Derived values
    // ─────────────────────────────────────────────────────────────────────────

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
      Array.isArray(watchedCharacteristics) &&
      watchedCharacteristics.length > 0;

    const selectedCharacteristics = useMemo(
      () =>
        normalizeSelectedCharacteristics(
          watchedCharacteristics,
          variantCustomFields,
        ),
      [variantCustomFields, watchedCharacteristics],
    );

    const variantCustomFieldOptions = useMemo(
      () =>
        sortVariantCustomFields(variantCustomFields).map((field) => ({
          value: field.id,
          label: field.label,
        })),
      [variantCustomFields],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Effects
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
      void loadVariantCustomFields();
    }, [loadVariantCustomFields]);

    useEffect(() => {
      if (!editingProductId) {
        productsStore.clearActiveProduct();
        return;
      }

      let alive = true;

      void (async () => {
        setIsInitialEditLoading(true);

        try {
          const product = await productsStore.loadProductById(editingProductId);

          if (!alive) {
            return;
          }

          const detailFormState = productDetailToProductForm(product);

          applyingInitialEditValuesRef.current = true;
          setProductType(detailFormState.productType);
          setProductMedia(detailFormState.productMedia);
          setProductVariants(detailFormState.variants);
          setExcludedVariantKeys(new Set(detailFormState.excludedVariantKeys));
          form.setFieldsValue(detailFormState.formValues);
          syncProductVariantsToForm(form, detailFormState.variants);
        } catch (error) {
          messageApi.error(
            getApiErrorMessage(error, t("products.detailLoadFailed")),
          );
          navigateToProductsList();
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
      messageApi,
      navigateToProductsList,
      productsStore,
      setProductMedia,
      t,
    ]);

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
          status: watchedStatus ?? "draft",
        },
        previousVariants,
      });

      const filteredGeneratedVariants = allGeneratedVariants.filter(
        (variant) => !currentExcludedKeys.has(variant.key),
      );

      const nextVariants = [...filteredGeneratedVariants, ...manualVariants];

      setProductVariants(nextVariants);
      syncProductVariantsToForm(form, nextVariants);
      // characteristicsSignature tracks watchedCharacteristics
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

    // ─────────────────────────────────────────────────────────────────────────
    // Derived option builders
    // ─────────────────────────────────────────────────────────────────────────

    const getCharacteristicValueOptions = useCallback(
      (attributeId?: number): Array<{ value: string; label: string }> =>
        buildCharacteristicValueOptions(attributeId, variantCustomFields),
      [variantCustomFields],
    );

    const getCharacteristicFieldOptionsForRow = useCallback(
      (currentAttributeId?: number) =>
        mapCharacteristicFieldSelectOptions(
          variantCustomFieldOptions,
          normalizeSelectedCharacteristics(
            watchedCharacteristics,
            variantCustomFields,
          ).flatMap((characteristic) =>
            characteristic.field.kind === "existing"
              ? [characteristic.field.id]
              : [],
          ),
          currentAttributeId,
        ),
      [variantCustomFieldOptions, variantCustomFields, watchedCharacteristics],
    );

    const getSingleCharacteristicFieldOptionsForRow = useCallback(
      (currentAttributeId?: number) =>
        mapCharacteristicFieldSelectOptions(
          variantCustomFieldOptions,
          normalizeSingleCharacteristics(watchedSingleCharacteristics).flatMap(
            (characteristic) =>
              characteristic.field.kind === "existing"
                ? [characteristic.field.id]
                : [],
          ),
          currentAttributeId,
        ),
      [variantCustomFieldOptions, watchedSingleCharacteristics],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Product type handlers
    // ─────────────────────────────────────────────────────────────────────────

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
            messageApi.warning(t("products.productType.switchToSingleBlocked"));
            return;
          }

          switchToSingle();
          return;
        }

        setProductType("variants");
        form.setFieldValue("singleCharacteristics", []);
      },
      [form, hasCharacteristicsAdded, isEditMode, messageApi, productType, t],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Variant handlers
    // ─────────────────────────────────────────────────────────────────────────

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
          messageApi.error(
            getApiErrorMessage(error, t("products.variantDeleteFailed")),
          );
        } finally {
          setDeletingVariantKey(null);
        }
      },
      [form, messageApi, t],
    );

    const handleAddManualVariant = useCallback(() => {
      const mergedVariants = mergeProductVariantsWithFormValues(
        productVariantsRef.current,
        form.getFieldValue("variants"),
      );

      const manualVariant = createManualVariant({
        price: Number(watchedPrice ?? 0),
        quantity: Number(watchedQuantity ?? 0),
        status: watchedStatus ?? "draft",
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

            return updateManualVariantCustomField(
              variant,
              fieldStableKey,
              value,
            );
          });

          syncProductVariantsToForm(form, nextVariants);
          return nextVariants;
        });
      },
      [form],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Variant table columns
    // ─────────────────────────────────────────────────────────────────────────

    const variantTableColumns = useProductAddVariantTableColumns({
      selectedCharacteristics,
      availableFields: variantCustomFields,
      onManageVariantImages: handleManageVariantImages,
      onDeleteVariant: handleDeleteVariant,
      onUpdateManualVariantCustomField: handleUpdateManualVariantCustomField,
      deletingVariantKey,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Submit handlers
    // ─────────────────────────────────────────────────────────────────────────

    const submitCreateProduct = useCallback(
      async (
        values: ProductCreateFormValues,
        submitProductType: ApiProductType,
        variantsForSubmit: ProductVariantUi[],
      ) => {
        setIsSavingProduct(true);

        try {
          const payload = normalizeCreateProductPayload({
            formValues: values,
            productType: submitProductType,
            productMedia: uploadedProductMedia,
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
            getApiErrorMessage(error, t("products.createFailed")),
          );
        } finally {
          setIsSavingProduct(false);
        }
      },
      [
        messageApi,
        navigateToProductsList,
        productsStore,
        t,
        uploadedProductMedia,
      ],
    );

    const submitUpdateProduct = useCallback(
      async (
        values: ProductCreateFormValues,
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
            productMedia: uploadedProductMedia,
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
            getApiErrorMessage(error, t("products.updateFailed")),
          );
        } finally {
          setIsSavingProduct(false);
        }
      },
      [
        editingProductId,
        messageApi,
        navigateToProductsList,
        productsStore,
        t,
        uploadedProductMedia,
      ],
    );

    const handleCreateProductSubmit = useCallback(
      async (values: ProductAddFormValues) => {
        const variantsForSubmit = mergeProductVariantsWithFormValues(
          productVariantsRef.current,
          form.getFieldValue("variants"),
        );

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
        form,
        isEditMode,
        messageApi,
        productType,
        submitCreateProduct,
        submitUpdateProduct,
        t,
      ],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Return value
    // ─────────────────────────────────────────────────────────────────────────

    const requiredMessage = t("products.form.required");

    return {
      // Context holder
      contextHolder,
      pageLoading: isInitialEditLoading,

      // Form
      form,
      initialValues: {
        ...defaultCreateValues,
        characteristics: [],
        singleCharacteristics: [],
        variants: [],
      },

      // Page meta
      title: t(
        isEditMode ? "products.editPage.title" : "products.addPage.title",
      ),
      subtitle: t(
        isEditMode ? "products.editPage.subtitle" : "products.addPage.subtitle",
      ),
      backLabel: t("products.detailBackToList"),
      navigateToProductsList,

      // Product type section
      productType,
      onProductTypeChange: handleProductTypeChange,

      // Main info section
      categoryOptions,
      requiredMessage,
      labels: {
        name: t("products.form.name"),
        category: t("products.form.category"),
        price: t("products.form.price"),
        quantity: t("products.form.quantity"),
        status: t("products.form.status"),
      },

      // Single characteristics section
      singleCharacteristicsProps: {
        watchedSingleCharacteristics,
        variantCustomFields,
        isVariantCustomFieldsLoading,
        getSingleCharacteristicFieldOptionsForRow,
        getCharacteristicValueOptions,
      },

      // Media section
      mediaProps: {
        uploadedProductMedia,
        productMediaUploadingCount,
        deletingProductMediaId,
        onBeforeUpload: handleProductImageBeforeUpload,
        onUpload: handleProductMediaUpload,
        onDelete: handleDeleteUploadedProductMedia,
        onReorder: handleReorderProductMedia,
        texts: {
          title: t("products.media.sectionTitle"),
          subtitle: t("products.media.sectionSubtitle"),
          dragUploadTitle: t("products.media.dragUploadTitle"),
          mainImageLabel: t("products.media.coverRadioLabel"),
          deleteTooltip: t("products.media.deleteTooltip"),
          uploadHint: t("products.media.uploadHintShort"),
          reorderHint: t("products.media.reorderHint"),
        },
      },

      // Variants section
      variantsProps: {
        productVariants,
        variantTableColumns,
        watchedCharacteristics,
        variantCustomFields,
        isVariantCustomFieldsLoading,
        getCharacteristicFieldOptionsForRow,
        getCharacteristicValueOptions,
        onAddManualVariant: handleAddManualVariant,
      },

      // Submit button
      submitButtonProps: {
        loading: isSavingProduct,
        disabled:
          isSavingProduct ||
          productMediaUploadingCount > 0 ||
          (isEditMode && productsStore.detailLoading),
        label: t(
          isEditMode ? "products.saveChanges" : "products.modalCreateOk",
        ),
        icon: isEditMode ? "save" : "create",
      },

      // Variant images modal
      variantImagesModalProps,

      // Submit handler
      onSubmit: handleCreateProductSubmit,
    };
  };
