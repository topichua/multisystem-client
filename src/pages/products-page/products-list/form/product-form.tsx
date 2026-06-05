import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { ArrowLeftIcon, FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Form } from "antd";
import type { FormInstance, FormProps } from "antd";
import { useCallback } from "react";
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
import type { ProductAddFormValues } from "./product-form.types";

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
  submitButtonProps,
  onSubmit,
}: ProductFormProps) => {
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

  return (
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
          <Flex vertical gap={16} style={{ maxWidth: 1100, margin: "0 auto" }}>
            <ProductFormHeader title={title} subtitle={subtitle} />

            <Flex vertical gap={16}>
              <ProductTypeSection
                value={productType}
                onChange={onProductTypeChange}
              />

              <ProductMainInfoSection
                categoryOptions={categoryOptions}
                requiredMessage={requiredMessage}
                labels={labels}
              />

              <ProductMediaSection
                uploadedProductMedia={mediaProps.uploadedProductMedia}
                productMediaUploadingCount={
                  mediaProps.productMediaUploadingCount
                }
                deletingProductMediaId={mediaProps.deletingProductMediaId}
                onBeforeUpload={mediaProps.onBeforeUpload}
                onUpload={mediaProps.onUpload}
                onDelete={mediaProps.onDelete}
                onReorder={mediaProps.onReorder}
                texts={mediaProps.texts}
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
                  getCharacteristicValueOptions={
                    singleCharacteristicsProps.getCharacteristicValueOptions
                  }
                />
              ) : null}

              {productType === "variants" ? (
                <ProductVariantsSection
                  productVariants={variantsProps.productVariants}
                  variantTableColumns={variantsProps.variantTableColumns}
                  watchedCharacteristics={variantsProps.watchedCharacteristics}
                  variantCustomFields={variantsProps.variantCustomFields}
                  isVariantCustomFieldsLoading={
                    variantsProps.isVariantCustomFieldsLoading
                  }
                  getCharacteristicValueOptions={
                    variantsProps.getCharacteristicValueOptions
                  }
                  onAddManualVariant={variantsProps.onAddManualVariant}
                />
              ) : null}

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
              >
                {submitButtonProps.label}
              </Button>
            </Flex>
          </Flex>
        </Form>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
};
