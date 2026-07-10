import { observer } from "mobx-react-lite";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { ProductForm } from "../form/product-form";
import { ProductVariantImagesModal } from "../form/variants/product-variant-images-modal";
import { useProductAddPageController } from "../controllers/use-product-add-page-controller";

export const ProductAddPage = observer(() => {
  const controller = useProductAddPageController();

  return (
    <>
      {controller.pageLoading ? (
        <CenteredSpinner minHeight={420} size="large" />
      ) : (
        <>
          <ProductForm
            form={controller.form}
            initialValues={controller.initialValues}
            title={controller.title}
            subtitle={controller.subtitle}
            backLabel={controller.backLabel}
            onBack={controller.navigateToProductsList}
            productType={controller.productType}
            onProductTypeChange={controller.onProductTypeChange}
            categoryOptions={controller.categoryOptions}
            requiredMessage={controller.requiredMessage}
            showMainQuantityField={controller.showMainQuantityField}
            showMainPriceField={controller.showMainPriceField}
            showStatusField={controller.showStatusField}
            labels={controller.labels}
            singleCharacteristicsProps={controller.singleCharacteristicsProps}
            mediaProps={controller.mediaProps}
            variantsProps={controller.variantsProps}
            submitButtonProps={controller.submitButtonProps}
            onSubmit={controller.onSubmit}
            onInstagramAiFill={controller.onInstagramAiFill}
          />

          <ProductVariantImagesModal
            open={controller.variantImagesModalProps.open}
            variant={controller.variantImagesModalProps.variant}
            productMedia={controller.variantImagesModalProps.productMedia}
            onClose={controller.variantImagesModalProps.onClose}
            onApply={controller.variantImagesModalProps.onApply}
            onUploadVariantImage={
              controller.variantImagesModalProps.onUploadVariantImage
            }
          />
        </>
      )}
    </>
  );
});
