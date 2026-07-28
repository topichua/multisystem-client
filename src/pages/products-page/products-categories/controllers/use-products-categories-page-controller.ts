import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  countCategoryTreeItems,
  filterCategoryTreeBySearch,
} from "../products-categories.utils";

export const useProductsCategoriesPageController = () => {
  const { t } = useTranslation();
  const store = useCategoriesStore();
  const notification = useNotification();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      await store.loadCategories();
      setLoadError(null);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, t("categories.loadFailed")));
    }
  }, [store, t]);

  useEffect(() => {
    let cancelled = false;

    void store
      .loadCategories()
      .then(() => {
        if (!cancelled) {
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, t("categories.loadFailed")));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [store, t]);

  const handleCreateRootCategory = useCallback(
    async (name: string) => {
      setCreateLoading(true);

      try {
        await store.createCategory({
          name,
          parentId: null,
        });
        notification.success({ title: t("categories.createSuccess") });
        setCreateModalOpen(false);
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("categories.createFailed")),
        });
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [notification, store, t],
  );

  const visibleCategories = useMemo(
    () => filterCategoryTreeBySearch(store.categories, searchValue),
    [searchValue, store.categories],
  );

  const categoriesCount = useMemo(
    () => countCategoryTreeItems(store.categories),
    [store.categories],
  );

  const searchActive = searchValue.trim().length > 0;
  const showInitialLoading = store.listLoading && store.categories.length === 0;

  return {
    categoriesCount,
    createLoading,
    createModalOpen,
    handleCreateRootCategory,
    loadCategories,
    loadError,
    searchActive,
    searchValue,
    setCreateModalOpen,
    setSearchValue,
    showInitialLoading,
    store,
    visibleCategories,
  };
};
