import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { ArrowLeftIcon, FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Form } from "antd";
import type { FormInstance, FormProps } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobileViewport } from "@/utils/use-media-query";
import {
  ProductTypeSection,
  type ProductType,
} from "./sections/product-type-section";
import { ProductMainInfoSection } from "./sections/product-main-info-section";
import {
  SingleProductCharacteristicsSection,
  type SingleProductCharacteristicsSectionProps,
} from "./sections/single-product-characteristics-section";
import {
  ProductMediaSection,
  type ProductMediaSectionProps,
} from "./sections/product-media-section";
import {
  ProductVariantsSection,
  type ProductVariantsSectionProps,
} from "./sections/product-variants-section";
import { ProductFormHeader } from "./sections/product-form-header";
import { ProductInstagramAiDrawer } from "../instagram-ai-panel";
import type { ProductAddFormValues } from "./product-form.types";
import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";
import type { Category } from "@/features/categories/model/category.types";
import * as MobileS from "./mobile-product-form-layout.styled";

export type ProductFormProps = {
  form: FormInstance<ProductAddFormValues>;
  initialValues: ProductAddFormValues;

  // Page meta
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
  isEditMode?: boolean;
  archiveLoading?: boolean;
  deleteLoading?: boolean;
  onArchiveProduct?: () => void;
  onDeleteProduct?: () => void;
  onManageInventory?: () => void;

  // Product type section
  productType: ProductType;
  onProductTypeChange: (nextType: ProductType) => void;

  // Main info section
  categories: Category[];
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  showMainQuantityField: boolean;
  isMainQuantityReadOnly?: boolean;
  showMainPriceField?: boolean;
  showMainSkuField?: boolean;
  // Publication parameters are temporarily hidden on product edit.
  // showStatusField?: boolean;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    // Publication parameters are temporarily hidden on product edit.
    // status: string;
    sku: string;
  };

  // Single characteristics section
  singleCharacteristicsProps: Omit<
    SingleProductCharacteristicsSectionProps,
    "form"
  >;

  // Media section
  mediaProps: ProductMediaSectionProps;

  // Variants section
  variantsProps: ProductVariantsSectionProps;

  // Submit button
  submitButtonProps: {
    loading: boolean;
    disabled: boolean;
    label: string;
    icon: "create" | "save";
  };

  // Submit handler
  onSubmit: (values: ProductAddFormValues) => Promise<void>;
  onInstagramAiFill: (
    extraction: InstagramPostAiExtractionResponse,
  ) => Promise<void>;
};

export const ProductForm = ({
  form,
  initialValues,
  title,
  subtitle,
  backLabel,
  onBack,
  isEditMode = false,
  archiveLoading = false,
  deleteLoading = false,
  onArchiveProduct,
  onDeleteProduct,
  onManageInventory,
  productType,
  onProductTypeChange,
  categories,
  categoryOptions,
  requiredMessage,
  showMainQuantityField,
  isMainQuantityReadOnly = false,
  showMainPriceField = true,
  showMainSkuField = false,
  // Publication parameters are temporarily hidden on product edit.
  // showStatusField = true,
  labels,
  singleCharacteristicsProps,
  mediaProps,
  variantsProps,
  submitButtonProps,
  onSubmit,
  onInstagramAiFill,
}: ProductFormProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const [instagramAiDrawerOpen, setInstagramAiDrawerOpen] = useState(false);

  const openInstagramAiDrawer = useCallback(() => {
    setInstagramAiDrawerOpen(true);
  }, []);

  const closeInstagramAiDrawer = useCallback(() => {
    setInstagramAiDrawerOpen(false);
  }, []);

  const handleInstagramAiFill = useCallback(
    async (extraction: InstagramPostAiExtractionResponse) => {
      await onInstagramAiFill(extraction);
      closeInstagramAiDrawer();
    },
    [closeInstagramAiDrawer, onInstagramAiFill],
  );

  const handleFinishFailed = useCallback<
    NonNullable<FormProps<ProductAddFormValues>["onFinishFailed"]>
  >(
    ({ errorFields }) => {
      const firstError = errorFields[0];

      if (!firstError) {
        return;
      }

      window.requestAnimationFrame(() => {
        form.scrollToField(firstError.name, {
          behavior: "smooth",
          block: "center",
        });
      });
    },
    [form],
  );

  const formSections = (
    <>
      {!isMobileViewport && (
        <ProductFormHeader
          title={title}
          subtitle={subtitle}
          onInstagramAiClick={openInstagramAiDrawer}
          isEditMode={isEditMode}
          archiveLoading={archiveLoading}
          deleteLoading={deleteLoading}
          onArchiveProduct={onArchiveProduct}
          onDeleteProduct={onDeleteProduct}
          onManageInventory={onManageInventory}
        />
      )}

      <ProductTypeSection
        value={productType}
        onChange={onProductTypeChange}
        isMobile={isMobileViewport}
      />

      {/*
      Publication parameters are temporarily hidden on product edit.
      showStatusField={showStatusField}
      */}
      <ProductMainInfoSection
        categories={categories}
        requiredMessage={requiredMessage}
        showQuantityField={showMainQuantityField}
        isQuantityReadOnly={isMainQuantityReadOnly}
        showPriceField={showMainPriceField}
        showSkuField={showMainSkuField}
        labels={labels}
        isMobile={isMobileViewport}
      />

      <ProductMediaSection
        uploadedProductMedia={mediaProps.uploadedProductMedia}
        productMediaUploadingCount={mediaProps.productMediaUploadingCount}
        deletingProductMediaId={mediaProps.deletingProductMediaId}
        onBeforeUpload={mediaProps.onBeforeUpload}
        onUpload={mediaProps.onUpload}
        onDelete={mediaProps.onDelete}
        onReorder={mediaProps.onReorder}
        texts={mediaProps.texts}
        isMobile={isMobileViewport}
      />

      {productType === "single" && (
        <SingleProductCharacteristicsSection
          form={form}
          watchedSingleCharacteristics={
            singleCharacteristicsProps.watchedSingleCharacteristics
          }
          variantCustomFields={singleCharacteristicsProps.variantCustomFields}
          isVariantCustomFieldsLoading={
            singleCharacteristicsProps.isVariantCustomFieldsLoading
          }
          getCharacteristicValueOptions={
            singleCharacteristicsProps.getCharacteristicValueOptions
          }
          isMobile={isMobileViewport}
        />
      )}

      {productType === "variants" && (
        <ProductVariantsSection
          productVariants={variantsProps.productVariants}
          variantTableColumns={variantsProps.variantTableColumns}
          watchedCharacteristics={variantsProps.watchedCharacteristics}
          variantCustomFields={variantsProps.variantCustomFields}
          isVariantCustomFieldsLoading={
            variantsProps.isVariantCustomFieldsLoading
          }
          optionBaseline={variantsProps.optionBaseline}
          optionEditRestrictionsActive={
            variantsProps.optionEditRestrictionsActive
          }
          getCharacteristicValueOptions={
            variantsProps.getCharacteristicValueOptions
          }
          onAddManualVariant={variantsProps.onAddManualVariant}
          selectedCharacteristics={variantsProps.selectedCharacteristics}
          onManageVariantImages={variantsProps.onManageVariantImages}
          onDeleteVariant={variantsProps.onDeleteVariant}
          onArchiveVariant={variantsProps.onArchiveVariant}
          onUnarchiveVariant={variantsProps.onUnarchiveVariant}
          onOpenInventory={variantsProps.onOpenInventory}
          onUpdateManualVariantCustomField={
            variantsProps.onUpdateManualVariantCustomField
          }
          deletingVariantKey={variantsProps.deletingVariantKey}
          deleteLoadingVariantId={variantsProps.deleteLoadingVariantId}
          archiveLoadingVariantId={variantsProps.archiveLoadingVariantId}
          showQuantityField={variantsProps.showQuantityField}
          showInventorySummary={variantsProps.showInventorySummary}
          showInventoryManagement={variantsProps.showInventoryManagement}
          onOpenProductInventory={variantsProps.onOpenProductInventory}
          onApplyPriceToAllVariants={variantsProps.onApplyPriceToAllVariants}
          isMobile={isMobileViewport}
        />
      )}
    </>
  );

  const submitButton = (
    <Button
      type="primary"
      htmlType="submit"
      loading={submitButtonProps.loading}
      disabled={submitButtonProps.disabled}
      icon={
        submitButtonProps.icon === "save" ? (
          <FloppyDiskIcon size={18} />
        ) : (
          <PlusIcon size={18} />
        )
      }
      size="large"
      block={isMobileViewport}
      aria-label={
        isMobileViewport ? t("products.mobile.form.saveAria") : undefined
      }
      data-qa={isMobileViewport ? "products-mobile-form-save" : undefined}
    >
      {submitButtonProps.label}
    </Button>
  );

  if (isMobileViewport) {
    return (
      <>
        <MobileS.MobileRoot>
          <MobileS.MobilePageHeader>
            <MobileS.MobileBackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("products.mobile.form.backToListAria")}
              data-qa="products-mobile-form-back"
              onClick={onBack}
            >
              {backLabel}
            </MobileS.MobileBackButton>
            <MobileS.MobilePageTitle level={3}>{title}</MobileS.MobilePageTitle>
            <ProductFormHeader
              title={title}
              subtitle={subtitle}
              onInstagramAiClick={openInstagramAiDrawer}
              isMobile
              isEditMode={isEditMode}
              archiveLoading={archiveLoading}
              deleteLoading={deleteLoading}
              onArchiveProduct={onArchiveProduct}
              onDeleteProduct={onDeleteProduct}
              onManageInventory={onManageInventory}
            />
          </MobileS.MobilePageHeader>

          <MobileS.MobileScrollRegion>
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={onSubmit}
              onFinishFailed={handleFinishFailed}
            >
              <MobileS.MobileFormSections vertical gap={16}>
                {formSections}
                <MobileS.MobileFormActions>
                  {submitButton}
                </MobileS.MobileFormActions>
              </MobileS.MobileFormSections>
            </Form>
          </MobileS.MobileScrollRegion>
        </MobileS.MobileRoot>

        <ProductInstagramAiDrawer
          open={instagramAiDrawerOpen}
          onClose={closeInstagramAiDrawer}
          categoryOptions={categoryOptions}
          onFillProductForm={handleInstagramAiFill}
          isMobile
        />
      </>
    );
  }

  return (
    <>
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header>
          <Button
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            onClick={onBack}
            style={{ alignSelf: "flex-start", paddingInlineStart: 0 }}
          >
            {backLabel}
          </Button>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body>
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onSubmit}
            onFinishFailed={handleFinishFailed}
            style={{ marginBottom: 50 }}
          >
            <Flex
              vertical
              gap={16}
              style={{ maxWidth: 1100, margin: "0 auto" }}
            >
              {formSections}
              {submitButton}
            </Flex>
          </Form>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <ProductInstagramAiDrawer
        open={instagramAiDrawerOpen}
        onClose={closeInstagramAiDrawer}
        categoryOptions={categoryOptions}
        onFillProductForm={handleInstagramAiFill}
      />
    </>
  );
};
