import { message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCategoryPath, pagesMap } from "@/app/router/pages-map";
import { findCategoryById } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { isCategoryDeleteHasChildrenError } from "@/features/categories/utils/category-delete-error";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";
import {
  resolveNextCategoryIdAfterDelete,
  sortCategoriesByName,
} from "../products-categories.utils";

export const useProductCategoryDetailController = () => {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const store = useCategoriesStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [deleteBlockedByApi, setDeleteBlockedByApi] = useState(false);
  const [renamingSubcategoryId, setRenamingSubcategoryId] = useState<
    number | null
  >(null);
  const [renamingSubcategoryName, setRenamingSubcategoryName] = useState("");
  const [isRenamingCategory, setIsRenamingCategory] = useState(false);
  const [renamingCategoryName, setRenamingCategoryName] = useState("");

  const categoryIdNumber = useMemo(() => {
    const parsedId = categoryId != null ? Number(categoryId) : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [categoryId]);

  const categoryFromList = useMemo(
    () =>
      categoryIdNumber != null
        ? findCategoryById(store.categories, categoryIdNumber)
        : undefined,
    [categoryIdNumber, store.categories],
  );

  const category = useMemo(() => {
    const matchedCategory =
      store.activeCategory?.id === categoryIdNumber
        ? store.activeCategory
        : categoryFromList;

    return matchedCategory?.parentId == null ? matchedCategory : undefined;
  }, [categoryFromList, categoryIdNumber, store.activeCategory]);

  const subcategories = useMemo(
    () => sortCategoriesByName(category?.children ?? []),
    [category?.children],
  );
  const currentCategoryId = category?.id ?? null;

  useEffect(() => {
    if (categoryIdNumber == null) {
      return;
    }

    void store.loadCategoryById(categoryIdNumber);
  }, [categoryIdNumber, store]);

  const validateCategoryName = useCallback(
    (name: string): boolean => {
      if (!name) {
        messageApi.error(t("categories.nameRequired"));
        return false;
      }

      if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        messageApi.error(t("categories.nameTooLong"));
        return false;
      }

      return true;
    },
    [messageApi, t],
  );

  const cancelRenameCategory = useCallback(() => {
    setIsRenamingCategory(false);
    setRenamingCategoryName("");
  }, []);

  const closeAddSubcategory = useCallback(() => {
    setIsAddingSubcategory(false);
    setSubcategoryName("");
  }, []);

  const cancelRenameSubcategory = useCallback(() => {
    setRenamingSubcategoryId(null);
    setRenamingSubcategoryName("");
  }, []);

  const openAddSubcategory = useCallback(() => {
    cancelRenameCategory();
    cancelRenameSubcategory();
    setSubcategoryName("");
    setIsAddingSubcategory(true);
  }, [cancelRenameCategory, cancelRenameSubcategory]);

  const openRenameSubcategory = useCallback(
    (childId: number, childName: string) => {
      cancelRenameCategory();
      closeAddSubcategory();
      setRenamingSubcategoryId(childId);
      setRenamingSubcategoryName(childName);
    },
    [cancelRenameCategory, closeAddSubcategory],
  );

  const openRenameCategory = useCallback(() => {
    if (!category) {
      return;
    }

    closeAddSubcategory();
    cancelRenameSubcategory();
    setIsRenamingCategory(true);
    setRenamingCategoryName(category.name);
  }, [cancelRenameSubcategory, category, closeAddSubcategory]);

  const handleRenameCategory = useCallback(async () => {
    if (!category) {
      return;
    }

    const name = renamingCategoryName.trim();

    if (!validateCategoryName(name)) {
      return;
    }

    if (category.name === name) {
      cancelRenameCategory();
      return;
    }

    try {
      await store.updateCategory(category.id, {
        name,
        parentId: category.parentId,
      });
      messageApi.success(t("categories.updated"));
      cancelRenameCategory();
      await store.loadCategoryById(category.id, { silent: true });
    } catch (error) {
      messageApi.error(getApiErrorMessage(error, t("categories.updateFailed")));
    }
  }, [
    cancelRenameCategory,
    category,
    messageApi,
    renamingCategoryName,
    store,
    t,
    validateCategoryName,
  ]);

  const handleCreateSubcategory = useCallback(async () => {
    if (!category) {
      return;
    }

    const name = subcategoryName.trim();

    if (!validateCategoryName(name)) {
      return;
    }

    const parentId = category.id;

    try {
      await store.createCategory({ name, parentId });
      messageApi.success(t("categories.createSuccess"));
      closeAddSubcategory();
      await store.loadCategoryById(parentId, { silent: true });
    } catch (error) {
      messageApi.error(getApiErrorMessage(error, t("categories.createFailed")));
    }
  }, [
    category,
    closeAddSubcategory,
    messageApi,
    store,
    subcategoryName,
    t,
    validateCategoryName,
  ]);

  const handleDeleteCategory = useCallback(async () => {
    if (!category) {
      return;
    }

    const nextCategoryId = resolveNextCategoryIdAfterDelete(
      store.categories,
      category.id,
    );

    setDeleteBlockedByApi(false);

    try {
      await store.deleteCategory(category.id);
      messageApi.success(t("categories.deleted"));

      if (nextCategoryId != null) {
        navigate(getProductCategoryPath(nextCategoryId));
        return;
      }

      navigate(pagesMap.productsCategories);
    } catch (error) {
      if (isCategoryDeleteHasChildrenError(error)) {
        setDeleteBlockedByApi(true);
        return;
      }

      messageApi.error(getApiErrorMessage(error, t("categories.deleteFailed")));
    }
  }, [category, messageApi, navigate, store, t]);

  const handleDeleteSubcategory = useCallback(
    async (childId: number) => {
      try {
        await store.deleteCategory(childId);
        if (renamingSubcategoryId === childId) {
          cancelRenameSubcategory();
        }
        setDeleteBlockedByApi(false);
        messageApi.success(t("categories.deleted"));
        if (currentCategoryId != null) {
          await store.loadCategoryById(currentCategoryId, { silent: true });
        }
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t("categories.deleteFailed")),
        );
      }
    },
    [
      cancelRenameSubcategory,
      currentCategoryId,
      messageApi,
      renamingSubcategoryId,
      store,
      t,
    ],
  );

  const handleRenameSubcategory = useCallback(
    async (childId: number, parentId: number | null) => {
      const name = renamingSubcategoryName.trim();

      if (!validateCategoryName(name)) {
        return;
      }

      const currentChild = subcategories.find((child) => child.id === childId);

      if (currentChild?.name === name) {
        cancelRenameSubcategory();
        return;
      }

      try {
        await store.updateCategory(childId, { name, parentId });
        messageApi.success(t("categories.updated"));
        cancelRenameSubcategory();
        if (currentCategoryId != null) {
          await store.loadCategoryById(currentCategoryId, { silent: true });
        }
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t("categories.updateFailed")),
        );
      }
    },
    [
      cancelRenameSubcategory,
      currentCategoryId,
      messageApi,
      renamingSubcategoryName,
      store,
      subcategories,
      t,
      validateCategoryName,
    ],
  );

  const navigateToCategories = useCallback(() => {
    navigate(pagesMap.productsCategories);
  }, [navigate]);

  return {
    contextHolder,
    category,
    subcategories,
    isInvalidCategoryId: categoryIdNumber == null,
    isPageLoading: (store.listLoading || store.detailLoading) && !category,
    isNotFound: !store.listLoading && !store.detailLoading && !category,
    saveLoading: store.saveLoading,
    deleteLoadingId: store.deleteLoadingId,
    deleteBlockedByApi,
    navigateToCategories,
    categoryNameEdit: {
      isEditing: isRenamingCategory,
      value: renamingCategoryName,
      onChange: setRenamingCategoryName,
      onOpen: openRenameCategory,
      onCancel: cancelRenameCategory,
      onSave: handleRenameCategory,
    },
    subcategoryCreate: {
      isAdding: isAddingSubcategory,
      value: subcategoryName,
      onChange: setSubcategoryName,
      onOpen: openAddSubcategory,
      onCancel: closeAddSubcategory,
      onCreate: handleCreateSubcategory,
    },
    subcategoryRename: {
      id: renamingSubcategoryId,
      value: renamingSubcategoryName,
      onChange: setRenamingSubcategoryName,
      onOpen: openRenameSubcategory,
      onCancel: cancelRenameSubcategory,
      onSave: handleRenameSubcategory,
    },
    onDeleteCategory: handleDeleteCategory,
    onDeleteSubcategory: handleDeleteSubcategory,
  };
};
