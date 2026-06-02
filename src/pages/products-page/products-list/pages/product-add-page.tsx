import { Spin } from "antd";
import { observer } from "mobx-react-lite";
import { ProductForm } from "../form/product-form";
import { ProductVariantImagesModal } from "../form/variants/product-variant-images-modal";
import { useProductAddPageController } from "../controllers/use-product-add-page-controller";

export const ProductAddPage = observer(() => {
  const controller = useProductAddPageController();

  return (
    <>
      {controller.contextHolder}

      {controller.pageLoading ? (
        <div
          style={{
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
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
            labels={controller.labels}
            singleCharacteristicsProps={controller.singleCharacteristicsProps}
            mediaProps={controller.mediaProps}
            variantsProps={controller.variantsProps}
            submitButtonProps={controller.submitButtonProps}
            onSubmit={controller.onSubmit}
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
            onRemoveVariantImage={
              controller.variantImagesModalProps.onRemoveVariantImage
            }
          />
        </>
      )}
    </>
  );
});
