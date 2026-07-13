import { Form } from "antd";
import type { FormInstance } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";
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
import { useProductAddVariantTableColumns } from "../form/variants/use-product-add-variant-table-columns";
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
  navigateToProductsList: () => void;
  productType: ProductType;
  onProductTypeChange: (nextType: ProductType) => void;
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  showMainQuantityField: boolean;
  showMainPriceField: boolean;
  showStatusField: boolean;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    status: string;
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
      navigateToProductsList,
      productsStore,
      variantCustomFields,
      isVariantCustomFieldsLoading,
      loadVariantCustomFields,
    } = useProductsListController();
    const { t } = useTranslation();
    const { productId } = useParams();
    const notification = useNotification();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const [form] = Form.useForm<ProductAddFormValues>();
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

    const variantTableColumns = useProductAddVariantTableColumns({
      selectedCharacteristics: variantsController.selectedCharacteristics,
      availableFields: variantCustomFields,
      onManageVariantImages: handleManageVariantImages,
      onDeleteVariant: variantsController.onDeleteVariant,
      onUpdateManualVariantCustomField:
        variantsController.onUpdateManualVariantCustomField,
      deletingVariantKey: variantsController.deletingVariantKey,
      showQuantityColumn: isSimpleInventoryMode,
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

    return {
      pageLoading:
        isInitialEditLoading ||
        (!workspaceSettingsReady && !workspaceSettingsStore.loadError),
      form,
      initialValues: {
        ...defaultCreateValues,
        characteristics: [],
        singleCharacteristics: [],
        variants: [],
      },
      title: t(
        isEditMode ? "products.editPage.title" : "products.addPage.title",
      ),
      subtitle: t(
        isEditMode ? "products.editPage.subtitle" : "products.addPage.subtitle",
      ),
      backLabel: t("products.detailBackToList"),
      navigateToProductsList,
      productType: variantsController.productType,
      onProductTypeChange: variantsController.onProductTypeChange,
      categoryOptions,
      requiredMessage,
      showMainQuantityField:
        isSimpleInventoryMode && variantsController.productType === "single",
      showMainPriceField: variantsController.productType === "single",
      showStatusField: isEditMode,
      labels: {
        name: t("products.form.name"),
        category: t("products.form.category"),
        price: t("products.form.price"),
        quantity: t("products.form.quantity"),
        status: t("products.form.status"),
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
        variantTableColumns,
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
