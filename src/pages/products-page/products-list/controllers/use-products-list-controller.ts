import { type TableProps } from "antd";
import { useCallback, useEffect, useMemo, useState, type Key } from "react";
import { useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { flattenCategories } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { Product } from "@/features/products/model/product.types";
import { readProductsListReturnSearch } from "@/features/products/model/products-list-url";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { InventoryMode } from "@/features/workspace-settings/model/workspace-settings.types";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/shared/components/notification/use-notification";

export const useProductsListController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const workspaceSettingsStore = useWorkspaceSettingsStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const notification = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    if (categoriesStore.categories.length === 0) {
      void categoriesStore.loadCategories({ silent: true });
    }
  }, [categoriesStore]);

  useEffect(() => {
    if (
      !workspaceSettingsStore.initialized &&
      !workspaceSettingsStore.loadLoading
    ) {
      void workspaceSettingsStore.loadSettings();
    }
  }, [workspaceSettingsStore]);

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
    const returnSearch = readProductsListReturnSearch(location.state);
    navigate({
      pathname: pagesMap.productsList,
      ...(returnSearch ? { search: returnSearch } : {}),
    });
  }, [location.state, navigate]);

  const handleDeleteById = useCallback(
    async (productId: number, options?: { navigateToList?: boolean }) => {
      try {
        await productsStore.deleteProduct(productId);
        notification.success({ title: t("products.deleteSuccess") });

        if (options?.navigateToList) {
          navigateToProductsList();
        }
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("products.deleteFailed")),
        });
      }
    },
    [notification, navigateToProductsList, productsStore, t],
  );

  const loadVariantCustomFields = useCallback(() => {
    return productsStore.loadVariantCustomFields();
  }, [productsStore]);

  return {
    productsStore,
    categoryNameById,
    categoryOptions,
    rowSelection,
    navigateToProductsList,
    variantCustomFields: productsStore.variantCustomFields,
    isVariantCustomFieldsLoading: productsStore.variantCustomFieldsLoading,
    showInventoryQuantity: workspaceSettingsStore.inventoryMode != null,
    showInventoryManagement:
      workspaceSettingsStore.inventoryMode === InventoryMode.advanced,
    loadVariantCustomFields,
    handleDeleteById,
  };
};
