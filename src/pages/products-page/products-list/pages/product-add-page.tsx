import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { ProductInventoryDrawer } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer";
import { isArchivedStatus } from "@/features/products/utils/product-display";

import { useProductAddPageController } from "../controllers/use-product-add-page-controller";
import { ProductForm } from "../form/product-form";
import { mapProductVariantUiToProductVariant } from "../form/variants/map-product-variant-ui-to-product-variant";
import type { ProductVariantUi } from "../form/variants/product-add-variant.types";
import { ProductVariantImagesModal } from "../form/variants/product-variant-images-modal";
import { useProductAddVariantTableColumns } from "../form/variants/use-product-add-variant-table-columns";
import { ProductArchiveModal } from "../list/components/product-archive-modal";
import { ProductHardDeleteModal } from "../list/components/product-hard-delete-modal";
import { useProductListLifecycleModals } from "../list/components/use-product-list-lifecycle-modals";

export const ProductAddPage = observer(() => {
  const controller = useProductAddPageController();
  const editingProductId = controller.editingProduct?.id ?? null;
  const [inventoryDrawerOpen, setInventoryDrawerOpen] = useState(false);
  const [inventoryTargetVariantId, setInventoryTargetVariantId] = useState<
    number | null
  >(null);
  const [inventoryFocusId, setInventoryFocusId] = useState(0);

  const {
    hardDeleteTarget,
    archiveTarget,
    hardDeleteLoading,
    archiveLoading,
    requestArchiveProduct,
    requestArchiveVariant,
    requestDeleteProduct,
    requestDeleteVariant,
    closeHardDeleteModal,
    closeArchiveModal,
    confirmHardDelete,
    confirmArchive,
  } = useProductListLifecycleModals({
    deleteLoadingId: controller.deleteLoading ? editingProductId : null,
    deleteLoadingVariantId: controller.deleteLoadingVariantId,
    archiveLoadingId: controller.archiveLoading ? editingProductId : null,
    archiveLoadingVariantId: controller.archiveLoadingVariantId,
    onDeleteProduct: (productId) =>
      controller.handleDeleteById(productId, { navigateToList: true }),
    onDeleteVariant: async (productId, variantId) => {
      const deleted = await controller.handleDeleteVariant(
        productId,
        variantId,
      );
      if (deleted) {
        controller.removeVariantById(variantId);
      }
      return deleted;
    },
    onArchiveProduct: controller.handleArchiveProduct,
    onArchiveVariant: async (productId, variantId) => {
      const archived = await controller.handleArchiveVariant(
        productId,
        variantId,
      );
      if (archived) {
        controller.setVariantStatusById(variantId, "archived");
      }
      return archived;
    },
  });

  const handleRequestArchiveProduct = useCallback(() => {
    if (controller.editingProduct == null) {
      return;
    }
    requestArchiveProduct(controller.editingProduct);
  }, [controller.editingProduct, requestArchiveProduct]);

  const handleRequestDeleteProduct = useCallback(() => {
    if (controller.editingProduct == null) {
      return;
    }
    requestDeleteProduct(controller.editingProduct);
  }, [controller.editingProduct, requestDeleteProduct]);

  const handleDeleteVariantClick = useCallback(
    (variant: ProductVariantUi) => {
      const mappedVariant = mapProductVariantUiToProductVariant(variant);
      if (
        controller.editingProduct == null ||
        mappedVariant == null ||
        !controller.isEditMode
      ) {
        void controller.onDeleteVariantLocal(variant);
        return;
      }

      requestDeleteVariant(controller.editingProduct, mappedVariant);
    },
    [controller, requestDeleteVariant],
  );

  const handleArchiveVariantClick = useCallback(
    (variant: ProductVariantUi) => {
      const mappedVariant = mapProductVariantUiToProductVariant(variant);
      if (controller.editingProduct == null || mappedVariant == null) {
        return;
      }
      requestArchiveVariant(controller.editingProduct, mappedVariant);
    },
    [controller.editingProduct, requestArchiveVariant],
  );

  const handleUnarchiveVariantClick = useCallback(
    (variant: ProductVariantUi) => {
      const productId = controller.editingProduct?.id;
      const variantId = variant.id;
      if (productId == null || variantId == null) {
        return;
      }

      void (async () => {
        const unarchived = await controller.handleUnarchiveVariant(
          productId,
          variantId,
        );
        if (unarchived) {
          controller.setVariantStatusById(variantId, "active");
        }
      })();
    },
    [controller],
  );

  const handleOpenVariantInventory = useCallback(
    (variant: ProductVariantUi) => {
      if (variant.id == null || isArchivedStatus(variant.status)) {
        return;
      }
      setInventoryTargetVariantId(variant.id);
      setInventoryFocusId((current) => current + 1);
      setInventoryDrawerOpen(true);
    },
    [],
  );

  const handleOpenProductInventory = useCallback(() => {
    setInventoryTargetVariantId(null);
    setInventoryFocusId((current) => current + 1);
    setInventoryDrawerOpen(true);
  }, []);

  const handleCloseInventoryDrawer = useCallback(() => {
    setInventoryDrawerOpen(false);
    setInventoryTargetVariantId(null);

    void controller.refreshVariantStockAfterInventory().catch(() => undefined);
  }, [controller]);

  const handleConfirmArchive = useCallback(async () => {
    const target = archiveTarget;
    const archived = await confirmArchive();

    if (archived && target?.type === "product") {
      controller.navigateToProductsList();
    }
  }, [archiveTarget, confirmArchive, controller]);

  const variantTableColumns = useProductAddVariantTableColumns({
    selectedCharacteristics: controller.selectedCharacteristics,
    availableFields: controller.variantsProps.variantCustomFields,
    onManageVariantImages: controller.onManageVariantImages,
    onDeleteVariant: handleDeleteVariantClick,
    onArchiveVariant: controller.isEditMode
      ? handleArchiveVariantClick
      : undefined,
    onUnarchiveVariant: controller.isEditMode
      ? handleUnarchiveVariantClick
      : undefined,
    onOpenInventory: controller.showInventoryManagement
      ? handleOpenVariantInventory
      : undefined,
    onUpdateManualVariantCustomField:
      controller.onUpdateManualVariantCustomField,
    deletingVariantKey: controller.deletingVariantKey,
    deleteLoadingVariantId: controller.deleteLoadingVariantId,
    archiveLoadingVariantId: controller.archiveLoadingVariantId,
    showQuantityColumn: controller.showQuantityColumn,
    showInventoryManagement: controller.showInventoryManagement,
    showPurchasePriceColumn:
      controller.showInventoryManagement && controller.isEditMode,
  });

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
            isEditMode={controller.isEditMode}
            archiveLoading={controller.archiveLoading}
            deleteLoading={controller.deleteLoading}
            onArchiveProduct={
              controller.isEditMode ? handleRequestArchiveProduct : undefined
            }
            onDeleteProduct={
              controller.isEditMode ? handleRequestDeleteProduct : undefined
            }
            onManageInventory={
              controller.showSingleProductInventoryManagement
                ? handleOpenProductInventory
                : undefined
            }
            productType={controller.productType}
            onProductTypeChange={controller.onProductTypeChange}
            categories={controller.categories}
            categoryOptions={controller.categoryOptions}
            requiredMessage={controller.requiredMessage}
            showMainQuantityField={controller.showMainQuantityField}
            isMainQuantityReadOnly={controller.isMainQuantityReadOnly}
            showMainPriceField={controller.showMainPriceField}
            showMainSkuField={controller.showMainSkuField}
            // Publication parameters are temporarily hidden on product edit.
            // showStatusField={controller.showStatusField}
            labels={controller.labels}
            singleCharacteristicsProps={controller.singleCharacteristicsProps}
            mediaProps={controller.mediaProps}
            variantsProps={{
              ...controller.variantsProps,
              variantTableColumns,
              onDeleteVariant: handleDeleteVariantClick,
              onArchiveVariant: controller.isEditMode
                ? handleArchiveVariantClick
                : undefined,
              onUnarchiveVariant: controller.isEditMode
                ? handleUnarchiveVariantClick
                : undefined,
              onOpenInventory: controller.showInventoryManagement
                ? handleOpenVariantInventory
                : undefined,
              onOpenProductInventory:
                controller.showInventoryManagement && controller.isEditMode
                  ? handleOpenProductInventory
                  : undefined,
              archiveLoadingVariantId: controller.archiveLoadingVariantId,
              deleteLoadingVariantId: controller.deleteLoadingVariantId,
              showInventorySummary: controller.showInventoryManagement,
              showInventoryManagement:
                controller.showInventoryManagement && controller.isEditMode,
            }}
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

          {controller.isEditMode && (
            <>
              <ProductHardDeleteModal
                open={hardDeleteTarget != null}
                target={hardDeleteTarget}
                loading={hardDeleteLoading}
                onCancel={closeHardDeleteModal}
                onConfirm={confirmHardDelete}
              />
              <ProductArchiveModal
                open={archiveTarget != null}
                target={archiveTarget}
                loading={archiveLoading}
                onCancel={closeArchiveModal}
                onConfirm={handleConfirmArchive}
              />
              <ProductInventoryDrawer
                open={
                  controller.showInventoryManagement &&
                  controller.editingProduct != null &&
                  inventoryDrawerOpen
                }
                product={controller.editingProduct}
                targetVariantId={inventoryTargetVariantId}
                targetVariantFocusId={inventoryFocusId}
                onClose={handleCloseInventoryDrawer}
                onOpenProduct={handleCloseInventoryDrawer}
              />
            </>
          )}
        </>
      )}
    </>
  );
});
