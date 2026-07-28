import type { Key } from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { isUncategorizedCategory } from "@/features/categories/model/category.constants";
import type { Category } from "@/features/categories/model/category.types";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { isCategoryDeleteHasChildrenError } from "@/features/categories/utils/category-delete-error";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  getExpandableCategoryKeys,
  hasCategoryUsage,
} from "../products-categories.utils";
import { resolveExpandedKeys } from "./products-categories-tree.utils";

type UseProductsCategoriesTreeParams = {
  categories: Category[];
  expandAll?: boolean;
};

export const useProductsCategoriesTree = ({
  categories,
  expandAll = false,
}: UseProductsCategoriesTreeParams) => {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const store = useCategoriesStore();
  const notification = useNotification();

  const [expandedKeys, setExpandedKeys] = useState<Key[]>(() =>
    getExpandableCategoryKeys(categories),
  );
  const [addingParentId, setAddingParentId] = useState<number | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [renamingCategoryId, setRenamingCategoryId] = useState<number | null>(
    null,
  );
  const [renamingCategoryName, setRenamingCategoryName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<Category | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");

  const expandableKeys = useMemo(
    () => getExpandableCategoryKeys(categories),
    [categories],
  );
  const expandableKeySet = useMemo(
    () => new Set(expandableKeys),
    [expandableKeys],
  );
  const [prevAddingParentId, setPrevAddingParentId] = useState(addingParentId);
  const [prevExpandAll, setPrevExpandAll] = useState(expandAll);
  const [prevExpandableKeys, setPrevExpandableKeys] = useState(expandableKeys);

  if (
    addingParentId !== prevAddingParentId ||
    expandAll !== prevExpandAll ||
    expandableKeys !== prevExpandableKeys
  ) {
    setPrevAddingParentId(addingParentId);
    setPrevExpandAll(expandAll);
    setPrevExpandableKeys(expandableKeys);
    setExpandedKeys(
      resolveExpandedKeys({
        addingParentId,
        currentKeys: expandedKeys,
        expandAll,
        expandableKeySet,
        expandableKeys,
      }),
    );
  }

  const selectedCategoryId = useMemo(() => {
    const parsedCategoryId = categoryId == null ? NaN : Number(categoryId);

    return Number.isFinite(parsedCategoryId) ? parsedCategoryId : null;
  }, [categoryId]);

  const toggleCategory = useCallback((categoryIdToToggle: number) => {
    const key = String(categoryIdToToggle);

    setExpandedKeys((currentKeys) =>
      currentKeys.includes(key)
        ? currentKeys.filter((currentKey) => currentKey !== key)
        : [...currentKeys, key],
    );
  }, []);

  const openAddSubcategory = useCallback((parentCategoryId: number) => {
    const parentKey = String(parentCategoryId);

    setAddingParentId(parentCategoryId);
    setSubcategoryName("");
    setExpandedKeys((currentKeys) =>
      currentKeys.includes(parentKey)
        ? currentKeys
        : [...currentKeys, parentKey],
    );
  }, []);

  const cancelAddSubcategory = useCallback(() => {
    setAddingParentId(null);
    setSubcategoryName("");
  }, []);

  const openRenameCategory = useCallback((category: Category) => {
    setAddingParentId(null);
    setSubcategoryName("");
    setRenamingCategoryId(category.id);
    setRenamingCategoryName(category.name);
  }, []);

  const cancelRenameCategory = useCallback(() => {
    setRenamingCategoryId(null);
    setRenamingCategoryName("");
  }, []);

  const handleCreateSubcategory = useCallback(async () => {
    if (addingParentId == null) {
      return;
    }

    const name = subcategoryName.trim();

    if (!name) {
      notification.error({ title: t("categories.nameRequired") });
      return;
    }

    setCreateLoading(true);

    try {
      await store.createCategory({
        name,
        parentId: addingParentId,
      });
      notification.success({ title: t("categories.createSuccess") });
      cancelAddSubcategory();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("categories.createFailed")),
      });
    } finally {
      setCreateLoading(false);
    }
  }, [
    addingParentId,
    cancelAddSubcategory,
    notification,
    store,
    subcategoryName,
    t,
  ]);

  const handleRenameCategory = useCallback(
    async (category: Category) => {
      const name = renamingCategoryName.trim();

      if (!name) {
        notification.error({ title: t("categories.nameRequired") });
        return;
      }

      if (name === category.name) {
        cancelRenameCategory();
        return;
      }

      setRenameLoading(true);

      try {
        await store.updateCategory(category.id, {
          name,
          parentId: category.parentId,
        });
        notification.success({ title: t("categories.updated") });
        cancelRenameCategory();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("categories.updateFailed")),
        });
      } finally {
        setRenameLoading(false);
      }
    },
    [cancelRenameCategory, notification, renamingCategoryName, store, t],
  );

  const deleteCategory = useCallback(
    async (
      category: Category,
      targetCategoryId?: number | null,
    ): Promise<boolean> => {
      try {
        await store.deleteCategory(
          category.id,
          targetCategoryId === undefined
            ? undefined
            : { categoryId: targetCategoryId },
        );
        notification.success({ title: t("categories.deleted") });

        if (addingParentId === category.id) {
          cancelAddSubcategory();
        }

        if (renamingCategoryId === category.id) {
          cancelRenameCategory();
        }

        return true;
      } catch (error) {
        if (isCategoryDeleteHasChildrenError(error)) {
          notification.error({
            title: t("categories.deleteBlockedHasChildrenTitle"),
            description: t("categories.deleteBlockedHasChildren"),
          });
          return false;
        }

        notification.error({
          title: getApiErrorMessage(error, t("categories.deleteFailed")),
        });
      }

      return false;
    },
    [
      addingParentId,
      cancelAddSubcategory,
      cancelRenameCategory,
      notification,
      renamingCategoryId,
      store,
      t,
    ],
  );

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      if (isUncategorizedCategory(category)) {
        return;
      }

      if (hasCategoryUsage(category)) {
        setPendingDeleteCategory(category);
        return;
      }

      await deleteCategory(category);
    },
    [deleteCategory],
  );

  const handleDeleteCategoryWithTransfer = useCallback(
    async (targetCategoryId: number | null) => {
      if (!pendingDeleteCategory) {
        return;
      }

      const deleted = await deleteCategory(
        pendingDeleteCategory,
        targetCategoryId,
      );

      if (deleted) {
        setPendingDeleteCategory(null);
      }
    },
    [deleteCategory, pendingDeleteCategory],
  );

  return {
    addingParentId,
    cancelAddSubcategory,
    cancelRenameCategory,
    createLoading,
    deleteLoadingId: store.deleteLoadingId,
    expandedKeys,
    handleCreateSubcategory,
    handleDeleteCategory,
    handleDeleteCategoryWithTransfer,
    handleRenameCategory,
    openAddSubcategory,
    openRenameCategory,
    pendingDeleteCategory,
    renameLoading,
    renamingCategoryId,
    renamingCategoryName,
    selectedCategoryId,
    setExpandedKeys,
    setPendingDeleteCategory,
    setRenamingCategoryName,
    setSubcategoryName,
    storeCategories: store.categories,
    subcategoryName,
    toggleCategory,
  };
};
