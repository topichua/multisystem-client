import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button, Flex, Form } from "antd";
import type { FormInstance } from "antd";
import {
  ProductTypeSection,
  type ProductType,
} from "./sections/product-type-section";
import { ProductMainInfoSection } from "./sections/product-main-info-section";
import { SingleProductCharacteristicsSection } from "./sections/single-product-characteristics-section";
import { ProductMediaSection } from "./sections/product-media-section";
import { ProductVariantsSection } from "./sections/product-variants-section";
import { ProductSidePanel } from "./sections/product-side-panel";
import { ProductFormHeader } from "./sections/product-form-header";
import type {
  ProductAddFormValues,
  ProductAddPageControllerReturn,
} from "../controllers/use-product-add-page-controller";

export type ProductFormProps = {
  form: FormInstance<ProductAddFormValues>;
  initialValues: ProductAddFormValues;

  // Page meta
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;

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
  singleCharacteristicsProps: ProductAddPageControllerReturn["singleCharacteristicsProps"];

  // Media section
  mediaProps: ProductAddPageControllerReturn["mediaProps"];

  // Variants section
  variantsProps: ProductAddPageControllerReturn["variantsProps"];

  // Side panel
  sidebarProps: ProductAddPageControllerReturn["sidebarProps"];

  // Submit handler
  onSubmit: (values: ProductAddFormValues) => Promise<void>;
};

export const ProductForm = ({
  form,
  initialValues,
  title,
  subtitle,
  backLabel,
  onBack,
  productType,
  onProductTypeChange,
  categoryOptions,
  requiredMessage,
  labels,
  singleCharacteristicsProps,
  mediaProps,
  variantsProps,
  sidebarProps,
  onSubmit,
}: ProductFormProps) => (
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
      >
        <Flex vertical gap={32}>
          <ProductFormHeader title={title} subtitle={subtitle} />

          <Flex gap={24} align="flex-start">
            <Flex vertical gap={24} flex="1 1 auto" style={{ minWidth: 0 }}>
              <ProductTypeSection
                value={productType}
                onChange={onProductTypeChange}
              />

              <ProductMainInfoSection
                categoryOptions={categoryOptions}
                requiredMessage={requiredMessage}
                labels={labels}
              />

              {productType === "single" ? (
                <SingleProductCharacteristicsSection
                  form={form}
                  watchedSingleCharacteristics={
                    singleCharacteristicsProps.watchedSingleCharacteristics
                  }
                  variantCustomFields={
                    singleCharacteristicsProps.variantCustomFields
                  }
                  isVariantCustomFieldsLoading={
                    singleCharacteristicsProps.isVariantCustomFieldsLoading
                  }
                  getSingleCharacteristicFieldOptionsForRow={
                    singleCharacteristicsProps.getSingleCharacteristicFieldOptionsForRow
                  }
                  getCharacteristicValueOptions={
                    singleCharacteristicsProps.getCharacteristicValueOptions
                  }
                />
              ) : null}

              <ProductMediaSection
                uploadedProductMedia={mediaProps.uploadedProductMedia}
                productMediaUploadingCount={
                  mediaProps.productMediaUploadingCount
                }
                deletingProductMediaId={mediaProps.deletingProductMediaId}
                onBeforeUpload={mediaProps.onBeforeUpload}
                onUpload={mediaProps.onUpload}
                onDelete={mediaProps.onDelete}
                texts={mediaProps.texts}
              />

              {productType === "variants" ? (
                <ProductVariantsSection
                  productVariants={variantsProps.productVariants}
                  variantTableColumns={variantsProps.variantTableColumns}
                  watchedCharacteristics={variantsProps.watchedCharacteristics}
                  variantCustomFields={variantsProps.variantCustomFields}
                  isVariantCustomFieldsLoading={
                    variantsProps.isVariantCustomFieldsLoading
                  }
                  getCharacteristicFieldOptionsForRow={
                    variantsProps.getCharacteristicFieldOptionsForRow
                  }
                  getCharacteristicValueOptions={
                    variantsProps.getCharacteristicValueOptions
                  }
                  onAddManualVariant={variantsProps.onAddManualVariant}
                />
              ) : null}
            </Flex>

            <ProductSidePanel
              isSubmitting={sidebarProps.isSubmitting}
              isSubmitDisabled={sidebarProps.isSubmitDisabled}
              submitLabel={sidebarProps.submitLabel}
              requiredMessage={sidebarProps.requiredMessage}
              statusLabel={sidebarProps.statusLabel}
            />
          </Flex>
        </Flex>
      </Form>
    </PaneDetailLayout.Body>
  </PaneDetailLayout.Root>
);
