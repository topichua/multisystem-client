import { Button, Form, Input, Modal, Select, Tree, message } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCategoryPath } from "@/app/router/pages-map";
import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import {
  categoriesEligibleAsParent,
  categoriesToTreeData,
  findAncestorIds,
} from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

type CategoryCreateFormValues = {
  name: string;
  parentId: number | null;
};

const defaultCreateValues: CategoryCreateFormValues = {
  name: "",
  parentId: null,
};

export const ProductsCategoriesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useCategoriesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<CategoryCreateFormValues>();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void store.loadCategories();
  }, [store]);

  const categoryIdFromPath = useMemo(() => {
    const match = location.pathname.match(/^\/products\/categories\/(\d+)$/);
    return match ? Number(match[1]) : NaN;
  }, [location.pathname]);

  const parentCategoryOptions = useMemo(
    () => categoriesEligibleAsParent(store.categories),
    [store.categories],
  );

  const treeData = useMemo(
    () => categoriesToTreeData(store.categories),
    [store.categories],
  );

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!Number.isFinite(categoryIdFromPath)) {
      return;
    }

    const ancestorIds = findAncestorIds(store.categories, categoryIdFromPath);
    const next = ancestorIds.map(String);

    setExpandedKeys((prev) => Array.from(new Set([...prev, ...next])));
  }, [categoryIdFromPath, store.categories]);

  const openCreate = useCallback(() => {
    form.setFieldsValue(defaultCreateValues);
    setModalOpen(true);
  }, [form]);

  const closeCreate = useCallback(() => {
    setModalOpen(false);
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
      await store.createCategory(values);
      messageApi.success(t("categories.createSuccess"));
      closeCreate();

      if (store.activeCategory) {
        navigate(getProductCategoryPath(store.activeCategory.id));
      }
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("categories.createFailed")));
      return Promise.reject();
    }
  }, [closeCreate, form, messageApi, navigate, store, t]);

  return (
    <>
      {contextHolder}
      <PaneNavSplitLayout.Root data-qa="layout-products-categories-shell">
        <PaneNavSplitLayout.SubSidebar data-qa="layout-products-categories-sidebar">
          <PaneSectionHeaderStack data-qa="layout-products-categories-header">
            <PaneSectionTitle>{t("categories.title")}</PaneSectionTitle>
            <Button type="primary" onClick={openCreate}>
              {t("categories.createCategory")}
            </Button>
          </PaneSectionHeaderStack>
          <PaneScrollRegion data-qa="layout-products-categories-nav-scroll">
            <div data-qa="layout-products-categories-nav">
              <Tree
                blockNode
                showLine
                treeData={treeData}
                selectedKeys={
                  Number.isFinite(categoryIdFromPath)
                    ? [String(categoryIdFromPath)]
                    : []
                }
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys as string[])}
                onSelect={(keys) => {
                  const id = keys[0];
                  if (id == null) {
                    return;
                  }
                  navigate(getProductCategoryPath(Number(id)));
                }}
              />
            </div>
          </PaneScrollRegion>
        </PaneNavSplitLayout.SubSidebar>
        <PaneNavSplitLayout.SubMain data-qa="layout-products-categories-main">
          <Outlet
            context={
              {
                onCreateClick: openCreate,
              } satisfies ProductsCategoriesOutletContext
            }
          />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <Modal
        title={t("categories.modalCreateTitle")}
        open={modalOpen}
        onCancel={closeCreate}
        onOk={handleCreate}
        okText={t("categories.okCreate")}
        confirmLoading={store.saveLoading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={defaultCreateValues}>
          <Form.Item
            name="name"
            label={t("categories.name")}
            rules={[
              { required: true, message: t("categories.nameRequired") },
              { max: 120, message: t("categories.nameTooLong") },
            ]}
          >
            <Input placeholder={t("categories.namePlaceholder")} />
          </Form.Item>
          <Form.Item name="parentId" label={t("categories.parentCategory")}>
            <Select
              allowClear
              placeholder={t("categories.noParent")}
              options={parentCategoryOptions.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export type ProductsCategoriesOutletContext = {
  onCreateClick: () => void;
};
