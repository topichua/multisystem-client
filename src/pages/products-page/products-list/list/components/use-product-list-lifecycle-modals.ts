import { useCallback, useState } from "react";

import type {
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";

import type { ProductListActionTarget } from "./product-list-action-target";
import { isProductListActionTargetLoading } from "./product-list-action-target";

type UseProductListLifecycleModalsParams = {
  deleteLoadingId: number | null;
  deleteLoadingVariantId: number | null;
  archiveLoadingId: number | null;
  archiveLoadingVariantId: number | null;
  onDeleteProduct: (productId: number) => Promise<boolean>;
  onDeleteVariant: (productId: number, variantId: number) => Promise<boolean>;
  onArchiveProduct: (productId: number) => Promise<boolean>;
  onArchiveVariant: (productId: number, variantId: number) => Promise<boolean>;
};

export function useProductListLifecycleModals({
  deleteLoadingId,
  deleteLoadingVariantId,
  archiveLoadingId,
  archiveLoadingVariantId,
  onDeleteProduct,
  onDeleteVariant,
  onArchiveProduct,
  onArchiveVariant,
}: UseProductListLifecycleModalsParams) {
  const [hardDeleteTarget, setHardDeleteTarget] =
    useState<ProductListActionTarget | null>(null);
  const [archiveTarget, setArchiveTarget] =
    useState<ProductListActionTarget | null>(null);

  const requestDeleteProduct = useCallback((product: Product) => {
    setHardDeleteTarget({ type: "product", product });
  }, []);

  const requestDeleteVariant = useCallback(
    (product: Product, variant: ProductVariant) => {
      setHardDeleteTarget({ type: "variant", product, variant });
    },
    [],
  );

  const requestArchiveProduct = useCallback((product: Product) => {
    setArchiveTarget({ type: "product", product });
  }, []);

  const requestArchiveVariant = useCallback(
    (product: Product, variant: ProductVariant) => {
      setArchiveTarget({ type: "variant", product, variant });
    },
    [],
  );

  const closeHardDeleteModal = useCallback(() => {
    setHardDeleteTarget(null);
  }, []);

  const closeArchiveModal = useCallback(() => {
    setArchiveTarget(null);
  }, []);

  const confirmHardDelete = useCallback(async (): Promise<boolean> => {
    if (hardDeleteTarget == null) {
      return false;
    }

    const deleted =
      hardDeleteTarget.type === "product"
        ? await onDeleteProduct(hardDeleteTarget.product.id)
        : await onDeleteVariant(
            hardDeleteTarget.product.id,
            hardDeleteTarget.variant.id,
          );

    if (!deleted) {
      return false;
    }

    setHardDeleteTarget(null);
    return true;
  }, [hardDeleteTarget, onDeleteProduct, onDeleteVariant]);

  const confirmArchive = useCallback(async (): Promise<boolean> => {
    if (archiveTarget == null) {
      return false;
    }

    const archived =
      archiveTarget.type === "product"
        ? await onArchiveProduct(archiveTarget.product.id)
        : await onArchiveVariant(
            archiveTarget.product.id,
            archiveTarget.variant.id,
          );

    if (!archived) {
      return false;
    }

    setArchiveTarget(null);
    return true;
  }, [archiveTarget, onArchiveProduct, onArchiveVariant]);

  return {
    hardDeleteTarget,
    archiveTarget,
    hardDeleteLoading: isProductListActionTargetLoading(
      hardDeleteTarget,
      deleteLoadingId,
      deleteLoadingVariantId,
    ),
    archiveLoading: isProductListActionTargetLoading(
      archiveTarget,
      archiveLoadingId,
      archiveLoadingVariantId,
    ),
    requestDeleteProduct,
    requestDeleteVariant,
    requestArchiveProduct,
    requestArchiveVariant,
    closeHardDeleteModal,
    closeArchiveModal,
    confirmHardDelete,
    confirmArchive,
  };
}
