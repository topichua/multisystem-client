import { Form } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";
import type { Category } from "@/features/categories/model/category.types";
import type { ProductDetails } from "@/features/products/model/product.types";
import { productsApi } from "@/features/products/api/products-api";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import {
  defaultCreateValues,
  type ProductAddFormValues,
} from "../form/product-form.types";
import type { ProductMediaSectionProps } from "../form/sections/product-media-section";
import type { ProductType } from "../form/sections/product-type-section";
import type { ProductVariantsSectionProps } from "../form/sections/product-variants-section";
import type { SingleProductCharacteristicsSectionProps } from "../form/sections/single-product-characteristics-section";
import type { SelectedCharacteristic } from "../form/variants/generate-product-variants";
import type { ProductVariantUi } from "../form/variants/product-add-variant.types";
import { useProductsListController } from "./use-products-list-controller";
import { useProductEditBootstrap } from "./use-product-edit-bootstrap";
import { useProductFormSubmitController } from "./use-product-form-submit-controller";
import {
  useProductMediaController,
  type ProductMediaControllerReturn,
} from "./use-product-media-controller";
import {
  useProductVariantImagesController,
  type ProductVariantImagesModalControllerProps,
} from "./use-product-variant-images-controller";
import { useProductVariantsController } from "./use-product-variants-controller";
import { useInstagramAiProductFillController } from "./use-instagram-ai-product-fill-controller";
import { useNotification } from "@/shared/components/notification/use-notification";

export type ProductAddPageControllerReturn = {
  pageLoading: boolean;
  form: FormInstance<ProductAddFormValues>;
  initialValues: ProductAddFormValues;
  title: string;
  subtitle: string;
  backLabel: string;
  isEditMode: boolean;
  editingProduct: ProductDetails | null;
  archiveLoading: boolean;
  deleteLoading: boolean;
  handleArchiveProduct: (productId: number) => Promise<boolean>;
  handleArchiveVariant: (
    productId: number,
    variantId: number,
  ) => Promise<boolean>;
  handleUnarchiveVariant: (
    productId: number,
    variantId: number,
  ) => Promise<boolean>;
  handleDeleteById: (
    productId: number,
    options?: { navigateToList?: boolean },
  ) => Promise<boolean>;
  handleDeleteVariant: (
    productId: number,
    variantId: number,
  ) => Promise<boolean>;
  showInventoryManagement: boolean;
  archiveLoadingVariantId: number | null;
  deleteLoadingVariantId: number | null;
  removeVariantById: (variantId: number) => void;
  setVariantStatusById: (
    variantId: number,
    status: ProductVariantUi["status"],
  ) => void;
  refreshVariantStockAfterInventory: () => Promise<void>;
  onDeleteVariantLocal: (variant: ProductVariantUi) => void;
  onManageVariantImages: (variant: ProductVariantUi) => void;
  selectedCharacteristics: SelectedCharacteristic[];
  deletingVariantKey: string | null;
  showQuantityColumn: boolean;
  onUpdateManualVariantCustomField: (
    variantKey: string,
    fieldStableKey: string,
    value: string,
  ) => void;
  navigateToProductsList: () => void;
  productType: ProductType;
  onProductTypeChange: (nextType: ProductType) => void;
  categories: Category[];
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  showMainQuantityField: boolean;
  isMainQuantityReadOnly: boolean;
  showMainPriceField: boolean;
  showMainSkuField: boolean;
  showSingleProductInventoryManagement: boolean;
  // Publication parameters are temporarily hidden on product edit.
  // showStatusField: boolean;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    // Publication parameters are temporarily hidden on product edit.
    // status: string;
    sku: string;
  };
  singleCharacteristicsProps: Omit<
    SingleProductCharacteristicsSectionProps,
    "form"
  >;
  mediaProps: ProductMediaSectionProps;
  variantsProps: ProductVariantsSectionProps;
  submitButtonProps: {
    loading: boolean;
    disabled: boolean;
    label: string;
    icon: "create" | "save";
  };
  variantImagesModalProps: ProductVariantImagesModalControllerProps;
  onInstagramAiFill: (
    extraction: InstagramPostAiExtractionResponse,
  ) => Promise<void>;
  onSubmit: (values: ProductAddFormValues) => Promise<void>;
};

export const useProductAddPageController =
  (): ProductAddPageControllerReturn => {
    const {
      categoryOptions,
      categories,
      navigateToProductsList,
      productsStore,
      variantCustomFields,
      isVariantCustomFieldsLoading,
      loadVariantCustomFields,
      handleArchiveProduct,
      handleArchiveVariant,
      handleUnarchiveVariant,
      handleDeleteById,
      handleDeleteVariant,
      showInventoryManagement,
    } = useProductsListController();
    const { t } = useTranslation();
    const { productId } = useParams();
    const notification = useNotification();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const [form] = Form.useForm<ProductAddFormValues>();
    const watchedProductName = Form.useWatch("name", form);
    const watchedQuantity = Form.useWatch("quantity", form);
    const parsedProductId = productId ? Number(productId) : null;
    const editingProductId =
      parsedProductId != null && Number.isFinite(parsedProductId)
        ? parsedProductId
        : null;
    const isEditMode = editingProductId != null;
    const inventoryMode = workspaceSettingsStore.inventoryMode;
    const isSimpleInventoryMode = inventoryMode === InventoryMode.simple;
    const workspaceSettingsReady =
      workspaceSettingsStore.initialized && inventoryMode != null;

    const variantsController = useProductVariantsController({
      form,
      editingProductId,
      isEditMode,
      notification,
      variantCustomFields,
      isVariantCustomFieldsLoading,
    });

    const {
      uploadedProductMedia,
      productMediaUploadingCount,
      deletingProductMediaId,
      setProductMedia,
      onBeforeUpload: handleProductImageBeforeUpload,
      onUpload: handleProductMediaUpload,
      onDelete: handleDeleteUploadedProductMedia,
      onReorder: handleReorderProductMedia,
    }: ProductMediaControllerReturn = useProductMediaController({
      getProductVariants: variantsController.getProductVariantsWithFormValues,
      notification,
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
      getProductVariants: variantsController.getProductVariantsWithFormValues,
      mergeVariantsWithFormValues:
        variantsController.mergeVariantsWithFormValues,
      setProductVariants: variantsController.setProductVariants,
      syncVariantsToForm: variantsController.syncVariantsToForm,
    });

    const isInitialEditLoading = useProductEditBootstrap({
      editingProductId,
      form,
      notification,
      navigateToProductsList,
      productsStore,
      setProductType: variantsController.setProductType,
      setProductMedia,
      setProductVariants: variantsController.setProductVariants,
      setExcludedVariantKeys: variantsController.setExcludedVariantKeys,
      setApplyingInitialEditValues:
        variantsController.setApplyingInitialEditValues,
      setLoadedOptionBaseline: variantsController.setLoadedOptionBaseline,
      resetLoadedOptionBaseline: variantsController.resetLoadedOptionBaseline,
    });

    const { isSavingProduct, onSubmit } = useProductFormSubmitController({
      editingProductId,
      getProductVariantsWithFormValues:
        variantsController.getProductVariantsWithFormValues,
      isEditMode,
      notification,
      navigateToProductsList,
      productMedia: uploadedProductMedia,
      productType: variantsController.productType,
      productsStore,
      optionBaseline: variantsController.optionBaseline,
      variantCustomFields,
      inventoryMode,
    });

    const {
      isApplyingInstagramAiExtraction,
      onInstagramAiFill: handleInstagramAiFill,
    } = useInstagramAiProductFillController({
      categoryOptions,
      form,
      loadVariantCustomFields,
      notification,
      productsStore,
      setProductMedia,
      uploadedProductMedia,
      variantsController,
    });

    useEffect(() => {
      void loadVariantCustomFields();
    }, [loadVariantCustomFields]);

    useEffect(() => {
      if (
        !workspaceSettingsStore.initialized &&
        !workspaceSettingsStore.loadLoading
      ) {
        void workspaceSettingsStore.loadSettings().catch(() => {
          notification.error({ title: t("system.settingsLoadError") });
        });
      }
    }, [notification, t, workspaceSettingsStore]);

    const requiredMessage = t("products.form.required");

    const editPageTitle = useMemo(() => {
      const trimmedName =
        typeof watchedProductName === "string" ? watchedProductName.trim() : "";

      return (
        trimmedName ||
        productsStore.activeProduct?.name ||
        t("products.editPage.title")
      );
    }, [productsStore.activeProduct?.name, t, watchedProductName]);

    const editPageSubtitle = useMemo(() => {
      const variants = variantsController.productVariants;
      const variantsCount =
        variantsController.productType === "variants"
          ? variants.length
          : Math.max(variants.length, 1);
      const stockFromVariants = variants.reduce(
        (sum, variant) => sum + Number(variant.quantity ?? 0),
        0,
      );
      const stockCount =
        variantsController.productType === "variants"
          ? stockFromVariants
          : Number(
              watchedQuantity ??
                productsStore.activeProduct?.quantity ??
                stockFromVariants,
            );

      return t("products.editPage.summary", {
        variants: t("products.table.variantsCount", { count: variantsCount }),
        stock: t("products.editPage.stockOnHand", { count: stockCount }),
      });
    }, [
      productsStore.activeProduct?.quantity,
      t,
      variantsController.productType,
      variantsController.productVariants,
      watchedQuantity,
    ]);

    const isSingleProductType = variantsController.productType === "single";
    const showSingleProductInventoryManagement =
      showInventoryManagement && isEditMode && isSingleProductType;
    const showMainQuantityField =
      isSingleProductType && (isSimpleInventoryMode || isEditMode);
    const isMainQuantityReadOnly =
      showInventoryManagement && isEditMode && isSingleProductType;

    const refreshVariantStockAfterInventory = useCallback(async () => {
      if (editingProductId == null) {
        return;
      }

      const [inventory, product] = await Promise.all([
        productsApi.getInventory(editingProductId),
        productsStore.loadProductById(editingProductId, { silent: true }),
      ]);

      variantsController.applyVariantStockFromInventory(inventory);

      if (isSingleProductType) {
        const stockVariant = inventory.variants?.[0];
        const nextQuantity = Number(
          stockVariant?.quantity ??
            stockVariant?.availableQuantity ??
            stockVariant?.stockQty ??
            product.variants?.[0]?.quantity ??
            product.quantity ??
            0,
        );

        form.setFieldValue(
          "quantity",
          Number.isFinite(nextQuantity) ? nextQuantity : 0,
        );
      }
    }, [
      editingProductId,
      form,
      isSingleProductType,
      productsStore,
      variantsController,
    ]);

    return {
      pageLoading:
        isInitialEditLoading ||
        (isEditMode && isVariantCustomFieldsLoading) ||
        (!workspaceSettingsReady && !workspaceSettingsStore.loadError),
      form,
      initialValues: {
        ...defaultCreateValues,
        characteristics: [],
        singleCharacteristics: [],
        variants: [],
      },
      title: isEditMode ? editPageTitle : t("products.addPage.title"),
      subtitle: isEditMode ? editPageSubtitle : t("products.addPage.subtitle"),
      backLabel: t("products.detailBackToList"),
      isEditMode,
      editingProduct: productsStore.activeProduct,
      archiveLoading:
        editingProductId != null &&
        productsStore.archiveLoadingId === editingProductId,
      deleteLoading:
        editingProductId != null &&
        productsStore.deleteLoadingId === editingProductId,
      handleArchiveProduct,
      handleArchiveVariant,
      handleUnarchiveVariant,
      handleDeleteById,
      handleDeleteVariant,
      showInventoryManagement,
      archiveLoadingVariantId: productsStore.archiveLoadingVariantId,
      deleteLoadingVariantId: productsStore.deleteLoadingVariantId,
      removeVariantById: variantsController.removeVariantById,
      setVariantStatusById: variantsController.setVariantStatusById,
      refreshVariantStockAfterInventory,
      onDeleteVariantLocal: variantsController.onDeleteVariant,
      onManageVariantImages: handleManageVariantImages,
      selectedCharacteristics: variantsController.selectedCharacteristics,
      deletingVariantKey: variantsController.deletingVariantKey,
      showQuantityColumn: isSimpleInventoryMode,
      onUpdateManualVariantCustomField:
        variantsController.onUpdateManualVariantCustomField,
      navigateToProductsList,
      productType: variantsController.productType,
      onProductTypeChange: variantsController.onProductTypeChange,
      categories,
      categoryOptions,
      requiredMessage,
      showMainQuantityField,
      isMainQuantityReadOnly,
      showMainPriceField: isSingleProductType,
      showMainSkuField: isSingleProductType,
      showSingleProductInventoryManagement,
      // Publication parameters are temporarily hidden on product edit.
      // showStatusField: isEditMode,
      labels: {
        name: t("products.form.name"),
        category: t("products.form.category"),
        price: t("products.form.price"),
        quantity: t("products.form.quantity"),
        // Publication parameters are temporarily hidden on product edit.
        // status: t("products.form.status"),
        sku: t("products.form.sku"),
      },
      singleCharacteristicsProps: {
        watchedSingleCharacteristics:
          variantsController.watchedSingleCharacteristics,
        variantCustomFields,
        isVariantCustomFieldsLoading,
        getCharacteristicValueOptions:
          variantsController.getCharacteristicValueOptions,
      },
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
          moveEarlierAria: t("products.mobile.form.moveImageEarlierAria"),
          moveLaterAria: t("products.mobile.form.moveImageLaterAria"),
        },
      },
      variantsProps: {
        productVariants: variantsController.productVariants,
        variantTableColumns: [],
        watchedCharacteristics: variantsController.watchedCharacteristics,
        variantCustomFields,
        isVariantCustomFieldsLoading,
        optionBaseline: variantsController.optionBaseline,
        optionEditRestrictionsActive:
          variantsController.optionEditRestrictionsActive,
        getCharacteristicValueOptions:
          variantsController.getCharacteristicValueOptions,
        onAddManualVariant: variantsController.onAddManualVariant,
        selectedCharacteristics: variantsController.selectedCharacteristics,
        onManageVariantImages: handleManageVariantImages,
        onDeleteVariant: variantsController.onDeleteVariant,
        onUpdateManualVariantCustomField:
          variantsController.onUpdateManualVariantCustomField,
        deletingVariantKey: variantsController.deletingVariantKey,
        showQuantityField: isSimpleInventoryMode,
        onApplyPriceToAllVariants: variantsController.onApplyPriceToAllVariants,
      },
      submitButtonProps: {
        loading: isSavingProduct,
        disabled:
          isSavingProduct ||
          !workspaceSettingsReady ||
          isApplyingInstagramAiExtraction ||
          productMediaUploadingCount > 0 ||
          (isEditMode && productsStore.detailLoading),
        label: t(
          isEditMode ? "products.saveChanges" : "products.modalCreateOk",
        ),
        icon: isEditMode ? "save" : "create",
      },
      variantImagesModalProps,
      onInstagramAiFill: handleInstagramAiFill,
      onSubmit,
    };
  };
