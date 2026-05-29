import { Form, message, Modal, Upload } from "antd";
import type { UploadProps } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ProductType as ApiProductType } from "@/features/products/model/product-create-api.types";
import { productsApi } from "@/features/products/api/products-api";
import {
  defaultCreateValues,
  type ProductCreateFormValues,
} from "../form/product-form.types";
import { normalizeCreateProductPayload } from "../form/payload/normalize-create-product-payload";
import type {
  ProductVariantUi,
  UploadedProductMedia,
  VariantMediaItem,
} from "../form/variants/product-add-variant.types";
import { generateProductVariantsFromCharacteristics } from "../form/variants/generate-product-variants";
import { validateProductImageFile } from "../form/media/product-image-upload";
import {
  createManualVariant,
  filterManualVariants,
  findDuplicateVariantKeys,
  getVariantOnlyMedia,
  hasMeaningfulVariantUserData,
  mergeProductVariantsWithFormValues,
  getCharacteristicValueOptions as buildCharacteristicValueOptions,
  getRemovedVariantOnlyMedia,
  isProductMediaUsedByVariants,
  mapCharacteristicFieldSelectOptions,
  normalizeSelectedCharacteristics,
  normalizeSingleCharacteristics,
  sortVariantCustomFields,
  syncProductVariantsToForm,
  updateManualVariantCustomField,
} from "../form/variants/product-add-variant.utils";
import { useProductAddVariantTableColumns } from "../form/variants/use-product-add-variant-table-columns";
import { useProductsListController } from "./use-products-list-controller";
import type { ProductType } from "../form/sections/product-type-section";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VARIANTS_TO_SINGLE_BLOCKED_MESSAGE =
  "у вас вже додані варіанти, вони можуть бути втрачені";

const PRODUCT_MEDIA_USED_BY_VARIANTS_MESSAGE =
  "This image is used in product variants. Remove it from variants first.";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProductMediaUploadRequestOptions = Parameters<
  NonNullable<UploadProps["customRequest"]>
>[0];

type CharacteristicRow = {
  attributeId?: number;
  values?: string[];
};

type SingleCharacteristicRow = {
  attributeId?: number;
  value?: string;
};

export type ProductAddFormValues = ProductCreateFormValues & {
  characteristics: CharacteristicRow[];
  singleCharacteristics: SingleCharacteristicRow[];
  variants: unknown[];
};

export type ProductAddPageControllerReturn = {
  // Context holder for message API
  contextHolder: React.ReactElement;

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
  mediaProps: {
    uploadedProductMedia: UploadedProductMedia[];
    productMediaUploadingCount: number;
    deletingProductMediaId: number | null;
    onBeforeUpload: (file: File) => boolean | typeof Upload.LIST_IGNORE;
    onUpload: (options: ProductMediaUploadRequestOptions) => void;
    onDelete: (mediaId: number) => void;
    texts: {
      title: string;
      subtitle: string;
      dragUploadTitle: string;
      mainImageLabel: string;
      deleteTooltip: string;
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

  // Side panel
  sidebarProps: {
    isSubmitting: boolean;
    isSubmitDisabled: boolean;
    submitLabel: string;
    requiredMessage: string;
    statusLabel: string;
  };

  // Variant images modal
  variantImagesModalProps: {
    open: boolean;
    variant: ProductVariantUi | null;
    productMedia: UploadedProductMedia[];
    onClose: () => void;
    onApply: (variantKey: string, media: VariantMediaItem[]) => void;
    onUploadVariantImage: (file: File) => Promise<VariantMediaItem>;
    onRemoveVariantImage: (media: VariantMediaItem) => Promise<void>;
  };

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
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm<ProductAddFormValues>();

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    const [productType, setProductType] = useState<ProductType>("single");
    const [productVariants, setProductVariants] = useState<ProductVariantUi[]>(
      [],
    );
    const [uploadedProductMedia, setUploadedProductMedia] = useState<
      UploadedProductMedia[]
    >([]);
    const [productMediaUploadingCount, setProductMediaUploadingCount] =
      useState(0);
    const [deletingProductMediaId, setDeletingProductMediaId] = useState<
      number | null
    >(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [variantImagesModalVariant, setVariantImagesModalVariant] =
      useState<ProductVariantUi | null>(null);
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

    useEffect(() => {
      productVariantsRef.current = productVariants;
    }, [productVariants]);

    useEffect(() => {
      excludedVariantKeysRef.current = excludedVariantKeys;
    }, [excludedVariantKeys]);

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
          normalizeSelectedCharacteristics(watchedCharacteristics),
        ),
      [watchedCharacteristics],
    );

    const variantCustomFieldsKey = useMemo(
      () => variantCustomFields.map((field) => field.id).join(","),
      [variantCustomFields],
    );

    const hasCharacteristicsAdded =
      Array.isArray(watchedCharacteristics) &&
      watchedCharacteristics.length > 0;

    const selectedCharacteristics = useMemo(
      () => normalizeSelectedCharacteristics(watchedCharacteristics),
      [watchedCharacteristics],
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
      if (productType !== "variants") {
        return;
      }

      const previousVariants = mergeProductVariantsWithFormValues(
        productVariantsRef.current,
        form.getFieldValue("variants"),
      );
      const manualVariants = filterManualVariants(previousVariants);
      const currentExcludedKeys = excludedVariantKeysRef.current;

      const allGeneratedVariants = generateProductVariantsFromCharacteristics({
        selectedCharacteristics: normalizeSelectedCharacteristics(
          watchedCharacteristics,
        ),
        availableFields: variantCustomFields,
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

      const removedVariantOnlyMedia = getRemovedVariantOnlyMedia(
        previousVariants.filter((variant) => variant.source === "generated"),
        filteredGeneratedVariants,
      );

      const applyGeneratedVariants = () => {
        setProductVariants(nextVariants);
        syncProductVariantsToForm(form, nextVariants);
      };

      if (removedVariantOnlyMedia.length === 0) {
        applyGeneratedVariants();
        return;
      }

      void (async () => {
        for (const media of removedVariantOnlyMedia) {
          try {
            await productsApi.deleteUploadedMedia(media.id);
          } catch (error) {
            messageApi.error(
              getApiErrorMessage(error, "Failed to delete variant image"),
            );
          }
        }

        applyGeneratedVariants();
      })();
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
      messageApi,
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
          normalizeSelectedCharacteristics(watchedCharacteristics).map(
            (characteristic) => characteristic.attributeId,
          ),
          currentAttributeId,
        ),
      [variantCustomFieldOptions, watchedCharacteristics],
    );

    const getSingleCharacteristicFieldOptionsForRow = useCallback(
      (currentAttributeId?: number) =>
        mapCharacteristicFieldSelectOptions(
          variantCustomFieldOptions,
          normalizeSingleCharacteristics(watchedSingleCharacteristics).map(
            (characteristic) => characteristic.attributeId,
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

          if (
            hasCharacteristicsAdded ||
            hasMeaningfulVariantUserData(variantsWithForm)
          ) {
            messageApi.warning(VARIANTS_TO_SINGLE_BLOCKED_MESSAGE);
            return;
          }

          setProductType("single");
          setProductVariants([]);
          setExcludedVariantKeys(new Set());
          form.setFieldValue("characteristics", []);
          form.setFieldValue("variants", []);
          form.setFieldValue("singleCharacteristics", []);
          return;
        }

        setProductType("variants");
        form.setFieldValue("singleCharacteristics", []);
      },
      [form, hasCharacteristicsAdded, messageApi, productType],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Variant images modal handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleManageVariantImages = useCallback(
      (variant: ProductVariantUi) => {
        const mergedVariants = mergeProductVariantsWithFormValues(
          productVariantsRef.current,
          form.getFieldValue("variants"),
        );
        const latestVariant =
          mergedVariants.find((item) => item.key === variant.key) ?? variant;

        setVariantImagesModalVariant(latestVariant);
      },
      [form],
    );

    const handleApplyVariantImages = useCallback(
      (variantKey: string, media: VariantMediaItem[]) => {
        setProductVariants((current) => {
          const mergedVariants = mergeProductVariantsWithFormValues(
            current,
            form.getFieldValue("variants"),
          );
          const nextVariants = mergedVariants.map((item) =>
            item.key === variantKey ? { ...item, media } : item,
          );

          syncProductVariantsToForm(form, nextVariants);
          return nextVariants;
        });
      },
      [form],
    );

    const handleUploadVariantOnlyImage = useCallback(async (file: File) => {
      const uploaded = await productsApi.uploadMedia(file);

      return {
        id: uploaded.id,
        src: uploaded.src,
        origin: "variant" as const,
      };
    }, []);

    const handleRemoveVariantOnlyImage = useCallback(
      async (media: VariantMediaItem) => {
        if (media.origin !== "variant") {
          return;
        }

        await productsApi.deleteUploadedMedia(media.id);
      },
      [],
    );

    const handleCloseVariantImagesModal = useCallback(() => {
      setVariantImagesModalVariant(null);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Variant handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleDeleteVariant = useCallback(
      async (variant: ProductVariantUi) => {
        setDeletingVariantKey(variant.key);

        try {
          const variantOnlyMedia = getVariantOnlyMedia(variant);

          for (const media of variantOnlyMedia) {
            try {
              await productsApi.deleteUploadedMedia(media.id);
            } catch (error) {
              messageApi.error(
                getApiErrorMessage(error, "Failed to delete variant image"),
              );
            }
          }

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
            getApiErrorMessage(error, "Failed to delete variant"),
          );
        } finally {
          setDeletingVariantKey(null);
        }
      },
      [form, messageApi],
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
        ),
        availableFields: variantCustomFields,
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
      (variantKey: string, fieldId: number, value: string) => {
        setProductVariants((current) => {
          const mergedVariants = mergeProductVariantsWithFormValues(
            current,
            form.getFieldValue("variants"),
          );

          const nextVariants = mergedVariants.map((variant) => {
            if (variant.key !== variantKey || variant.source !== "manual") {
              return variant;
            }

            return updateManualVariantCustomField(variant, fieldId, value);
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
    // Product media handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleProductMediaUpload = useCallback(
      async (options: ProductMediaUploadRequestOptions) => {
        const file = options.file as File;
        const validationError = validateProductImageFile(file);

        if (validationError) {
          options.onError?.(new Error(validationError));
          messageApi.error(validationError);
          return;
        }

        setProductMediaUploadingCount((count) => count + 1);

        try {
          const uploaded = await productsApi.uploadMedia(file);

          setUploadedProductMedia((previous) => [...previous, uploaded]);
          options.onSuccess?.(uploaded);
        } catch (error) {
          options.onError?.(error as Error);
          messageApi.error(getApiErrorMessage(error, "Failed to upload image"));
        } finally {
          setProductMediaUploadingCount((count) => Math.max(0, count - 1));
        }
      },
      [messageApi],
    );

    const handleDeleteUploadedProductMedia = useCallback(
      async (mediaId: number) => {
        const variantsWithForm = mergeProductVariantsWithFormValues(
          productVariantsRef.current,
          form.getFieldValue("variants"),
        );

        if (isProductMediaUsedByVariants(mediaId, variantsWithForm)) {
          messageApi.warning(PRODUCT_MEDIA_USED_BY_VARIANTS_MESSAGE);
          return;
        }

        setDeletingProductMediaId(mediaId);

        try {
          await productsApi.deleteUploadedMedia(mediaId);
          setUploadedProductMedia((previous) =>
            previous.filter((media) => media.id !== mediaId),
          );
        } catch (error) {
          messageApi.error(
            getApiErrorMessage(error, t("products.media.deleteFailed")),
          );
        } finally {
          setDeletingProductMediaId((current) =>
            current === mediaId ? null : current,
          );
        }
      },
      [form, messageApi, t],
    );

    const handleProductImageBeforeUpload = useCallback(
      (file: File) => {
        const validationError = validateProductImageFile(file);
        if (validationError) {
          messageApi.error(validationError);
          return Upload.LIST_IGNORE;
        }

        return true;
      },
      [messageApi],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Submit handlers
    // ─────────────────────────────────────────────────────────────────────────

    const submitCreateProduct = useCallback(
      async (
        values: ProductCreateFormValues,
        submitProductType: ApiProductType,
        variantsForSubmit: ProductVariantUi[],
      ) => {
        setIsCreatingProduct(true);

        try {
          const payload = normalizeCreateProductPayload({
            formValues: values,
            productType: submitProductType,
            productMedia: uploadedProductMedia,
            variants: variantsForSubmit,
          });

          if (payload.variants.length === 0) {
            messageApi.error("Add at least one variant.");
            return;
          }

          await productsApi.createProduct(payload);
          messageApi.success(t("products.createSuccess"));
          await productsStore.loadProducts({ silent: true });
          navigateToProductsList();
        } catch (error) {
          messageApi.error(
            getApiErrorMessage(error, t("products.createFailed")),
          );
        } finally {
          setIsCreatingProduct(false);
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

    const handleCreateProductSubmit = useCallback(
      async (values: ProductAddFormValues) => {
        const variantsForSubmit = mergeProductVariantsWithFormValues(
          productVariantsRef.current,
          form.getFieldValue("variants"),
        );

        if (productType === "variants" && variantsForSubmit.length === 0) {
          messageApi.error("Add at least one variant.");
          return;
        }

        const duplicateKeys = findDuplicateVariantKeys(variantsForSubmit);
        if (duplicateKeys.size > 0) {
          messageApi.error(
            "Variant with the same characteristics already exists.",
          );
          return;
        }

        const manualVariantsWithMissingFields = variantsForSubmit.filter(
          (variant) =>
            variant.source === "manual" &&
            variant.customFields.length > 0 &&
            variant.customFields.some((field) => !field.value.trim()),
        );
        if (manualVariantsWithMissingFields.length > 0) {
          messageApi.error(
            "Manual variants must have all characteristic values filled.",
          );
          return;
        }

        if (productType === "variants" && variantsForSubmit.length === 1) {
          Modal.confirm({
            content: "Product will be created as a single product.",
            okText: t("products.modalCreateOk"),
            cancelText: "Cancel",
            onOk: () =>
              submitCreateProduct(values, "single", variantsForSubmit),
          });
          return;
        }

        if (productType === "single") {
          await submitCreateProduct(values, "single", []);
          return;
        }

        await submitCreateProduct(
          values,
          productType as ApiProductType,
          variantsForSubmit,
        );
      },
      [form, messageApi, productType, submitCreateProduct, t],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Return value
    // ─────────────────────────────────────────────────────────────────────────

    const requiredMessage = t("products.form.required");

    return {
      // Context holder
      contextHolder,

      // Form
      form,
      initialValues: {
        ...defaultCreateValues,
        characteristics: [],
        singleCharacteristics: [],
        variants: [],
      },

      // Page meta
      title: "Add product",
      subtitle: "Fill information about product",
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
        texts: {
          title: "Product images",
          subtitle: "Add product pictures",
          dragUploadTitle: t("products.media.dragUploadTitle"),
          mainImageLabel: t("products.media.coverRadioLabel"),
          deleteTooltip: t("products.media.deleteTooltip"),
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

      // Side panel
      sidebarProps: {
        isSubmitting: isCreatingProduct,
        isSubmitDisabled: isCreatingProduct || productMediaUploadingCount > 0,
        submitLabel: t("products.modalCreateOk"),
        requiredMessage,
        statusLabel: t("products.form.status"),
      },

      // Variant images modal
      variantImagesModalProps: {
        open: variantImagesModalVariant != null,
        variant: variantImagesModalVariant,
        productMedia: uploadedProductMedia,
        onClose: handleCloseVariantImagesModal,
        onApply: handleApplyVariantImages,
        onUploadVariantImage: handleUploadVariantOnlyImage,
        onRemoveVariantImage: handleRemoveVariantOnlyImage,
      },

      // Submit handler
      onSubmit: handleCreateProductSubmit,
    };
  };
