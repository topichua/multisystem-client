import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCategoryPath, pagesMap } from "@/app/router/pages-map";
import { categoriesEligibleAsParent } from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

import { getRootCategories } from "../products-categories.utils";
import { useNotification } from "@/shared/components/notification/use-notification";

export type CategoryCreateFormValues = {
  name: string;
  parentId: number | null;
};

export const defaultCreateValues: CategoryCreateFormValues = {
  name: "",
  parentId: null,
};

export const useProductsCategoriesLayoutController = () => {
  const { t } = useTranslation();
  const store = useCategoriesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const [form] = Form.useForm<CategoryCreateFormValues>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    void store.loadCategories();
  }, [store]);

  const activeCategoryId = useMemo(() => {
    const match = matchPath(
      { path: `${pagesMap.productsCategories}/:categoryId`, end: true },
      location.pathname,
    );
    const parsedId = match?.params.categoryId
      ? Number(match.params.categoryId)
      : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [location.pathname]);

  const parentCategoryOptions = useMemo(
    () => categoriesEligibleAsParent(store.categories),
    [store.categories],
  );

  const rootCategories = useMemo(
    () => getRootCategories(store.categories),
    [store.categories],
  );

  const visibleCategories = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return rootCategories;
    }

    return rootCategories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearch),
    );
  }, [rootCategories, searchValue]);

  const openCreate = useCallback(() => {
    form.setFieldsValue(defaultCreateValues);
    setCreateModalOpen(true);
  }, [form]);

  const closeCreate = useCallback(() => {
    setCreateModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleCreate = useCallback(async () => {
    let values: CategoryCreateFormValues;

    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    try {
      const createdCategory = await store.createCategory({
        name: values.name,
        parentId: values.parentId ?? null,
      });

      notification.success({ title: t("categories.createSuccess") });
      closeCreate();

      if (values.parentId == null) {
        navigate(getProductCategoryPath(createdCategory.id));
      }
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("categories.createFailed")),
      });
      return Promise.reject();
    }
  }, [closeCreate, form, notification, navigate, store, t]);

  const navigateToCategory = useCallback(
    (categoryId: number) => {
      navigate(getProductCategoryPath(categoryId));
    },
    [navigate],
  );

  return {
    store,
    form,
    createModalOpen,
    searchValue,
    activeCategoryId,
    parentCategoryOptions,
    visibleCategories,
    openCreate,
    closeCreate,
    setSearchValue,
    handleCreate,
    navigateToCategory,
  };
};
