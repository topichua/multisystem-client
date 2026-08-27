import { type TableProps } from "antd";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Key,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { flattenCategories } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { Product } from "@/features/products/model/product.types";
import { readProductsListReturnSearch } from "@/features/products/model/products-list-url";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useNotification } from "@/shared/components/notification/use-notification";

export const useProductsListController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationStateRef = useRef(location.state);
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const notification = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    locationStateRef.current = location.state;
  }, [location.state]);

  useEffect(() => {
    if (categoriesStore.categories.length === 0) {
      void categoriesStore.loadCategories({ silent: true });
    }
  }, [categoriesStore]);

  useEffect(() => {
    if (
      productsStore.variantCustomFields.length === 0 &&
      !productsStore.variantCustomFieldsLoading
    ) {
      void productsStore.loadVariantCustomFields();
    }
  }, [productsStore]);

  useEffect(() => {
    if (
      !workspaceSettingsStore.initialized &&
      !workspaceSettingsStore.loadLoading
    ) {
      void workspaceSettingsStore.loadSettings();
    }
  }, [workspaceSettingsStore]);

  useEffect(() => {
    if (
      workspaceSettingsStore.wishlistEnabled === false &&
      productsStore.listWishlistOnly
    ) {
      productsStore.clearListWishlistOnly();
    }
  }, [productsStore, workspaceSettingsStore.wishlistEnabled]);

  useEffect(() => {
    if (
      workspaceSettingsStore.inventoryMode != null &&
      workspaceSettingsStore.inventoryMode !== InventoryMode.advanced &&
      productsStore.listShowOnlyReserved
    ) {
      productsStore.clearListShowOnlyReserved();
    }
  }, [productsStore, workspaceSettingsStore.inventoryMode]);

  const categoryNameById = useMemo(
    () =>
      new Map(
        flattenCategories(categoriesStore.categories).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categoriesStore.categories],
  );

  const categoryOptions = useMemo(
    () =>
      flattenCategories(categoriesStore.categories).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesStore.categories],
  );

  const rowSelection: TableProps<Product>["rowSelection"] = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys),
    }),
    [selectedRowKeys],
  );

  const navigateToProductsList = useCallback(() => {
    const returnSearch = readProductsListReturnSearch(locationStateRef.current);
    navigate({
      pathname: pagesMap.productsList,
      ...(returnSearch ? { search: returnSearch } : {}),
    });
  }, [navigate]);

  const runAction = useCallback(
    async (
      action: () => Promise<void>,
      messages: { success: string; failed: string },
    ): Promise<boolean> => {
      try {
        await action();
        notification.success({ title: messages.success });
        return true;
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, messages.failed),
        });
        return false;
      }
    },
    [notification],
  );

  const handleDeleteById = useCallback(
    async (
      productId: number,
      options?: { navigateToList?: boolean },
    ): Promise<boolean> => {
      const deleted = await runAction(
        () => productsStore.deleteProduct(productId),
        {
          success: t("products.deleteSuccess"),
          failed: t("products.deleteFailed"),
        },
      );

      if (deleted && options?.navigateToList) {
        navigateToProductsList();
      }

      return deleted;
    },
    [navigateToProductsList, productsStore, runAction, t],
  );

  const handleDeleteVariant = useCallback(
    (productId: number, variantId: number) =>
      runAction(() => productsStore.deleteVariant(productId, variantId), {
        success: t("products.variantDeleteSuccess"),
        failed: t("products.variantDeleteFailed"),
      }),
    [productsStore, runAction, t],
  );

  const handleArchiveProduct = useCallback(
    (productId: number) =>
      runAction(() => productsStore.archiveProduct(productId), {
        success: t("products.archiveSuccess"),
        failed: t("products.archiveFailed"),
      }),
    [productsStore, runAction, t],
  );

  const handleUnarchiveProduct = useCallback(
    async (productId: number): Promise<void> => {
      await runAction(() => productsStore.unarchiveProduct(productId), {
        success: t("products.unarchiveSuccess"),
        failed: t("products.unarchiveFailed"),
      });
    },
    [productsStore, runAction, t],
  );

  const handleArchiveVariant = useCallback(
    (productId: number, variantId: number) =>
      runAction(() => productsStore.archiveVariant(productId, variantId), {
        success: t("products.variantArchiveSuccess"),
        failed: t("products.variantArchiveFailed"),
      }),
    [productsStore, runAction, t],
  );

  const handleUnarchiveVariant = useCallback(
    (productId: number, variantId: number) =>
      runAction(() => productsStore.unarchiveVariant(productId, variantId), {
        success: t("products.variantUnarchiveSuccess"),
        failed: t("products.variantUnarchiveFailed"),
      }),
    [productsStore, runAction, t],
  );

  const loadVariantCustomFields = useCallback(() => {
    return productsStore.loadVariantCustomFields();
  }, [productsStore]);

  return {
    productsStore,
    categories: categoriesStore.categories,
    categoryNameById,
    categoryOptions,
    rowSelection,
    navigateToProductsList,
    variantCustomFields: productsStore.variantCustomFields,
    isVariantCustomFieldsLoading: productsStore.variantCustomFieldsLoading,
    showInventoryQuantity:
      workspaceSettingsStore.inventoryMode === InventoryMode.advanced,
    showInventoryManagement:
      workspaceSettingsStore.inventoryMode === InventoryMode.advanced,
    loadVariantCustomFields,
    handleDeleteById,
    handleDeleteVariant,
    handleArchiveProduct,
    handleUnarchiveProduct,
    handleArchiveVariant,
    handleUnarchiveVariant,
  };
};
