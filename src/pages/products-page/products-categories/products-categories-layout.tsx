import {
  Button,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
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
  countCategoryDescendants,
} from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { CaretRightIcon, FolderIcon, PlusIcon } from "@phosphor-icons/react";
import * as S from "./products-categories-layout.styled";

const { Text } = Typography;

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
  const [searchValue, setSearchValue] = useState("");

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
      await store.createCategory({
        name: values.name,
        parentId: values.parentId ?? null,
      });
      messageApi.success(t("categories.createSuccess"));
      closeCreate();

      if (values.parentId == null && store.activeCategory) {
        navigate(getProductCategoryPath(store.activeCategory.id));
      }
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("categories.createFailed")));
      return Promise.reject();
    }
  }, [closeCreate, form, messageApi, navigate, store, t]);

  const rootCategories = useMemo(
    () => store.categories.filter((category) => category.parentId == null),
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

  return (
    <>
      {contextHolder}
      <PaneNavSplitLayout.Root
        data-qa="layout-products-categories-shell"
        customWidth={350}
      >
        <PaneNavSplitLayout.SubSidebar data-qa="layout-products-categories-sidebar">
          <PaneSectionHeaderStack data-qa="layout-products-categories-header">
            <Flex align="center" justify="space-between" gap={12}>
              <div>
                <PaneSectionTitle>{t("categories.title")}</PaneSectionTitle>
                <Text type="secondary">
                  {store.categories.length} {t("categories.itemsCount")}
                </Text>
              </div>

              <Button type="primary" icon={<PlusIcon />} onClick={openCreate}>
                {t("categories.createCategory")}
              </Button>
            </Flex>

            <Input.Search
              allowClear
              placeholder={t("categories.searchPlaceholder")}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </PaneSectionHeaderStack>

          <PaneScrollRegion data-qa="layout-products-categories-nav-scroll">
            <div data-qa="layout-products-categories-nav">
              {visibleCategories.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("categories.emptySearch")}
                />
              ) : (
                visibleCategories.map((category) => {
                  const isActive = category.id === categoryIdFromPath;
                  const subcategoriesCount = countCategoryDescendants(category);

                  return (
                    <S.CategoryNavItem
                      key={category.id}
                      $active={isActive}
                      onClick={() =>
                        navigate(getProductCategoryPath(category.id))
                      }
                    >
                      <Flex align="center" gap={12}>
                        <S.CategoryNavIcon $active={isActive}>
                          <FolderIcon />
                        </S.CategoryNavIcon>

                        <Flex vertical flex={1}>
                          <Text strong>{category.name}</Text>

                          <Text type="secondary">
                            {subcategoriesCount}{" "}
                            {t("categories.subcategoriesCount")}
                          </Text>
                        </Flex>

                        <CaretRightIcon />
                      </Flex>
                    </S.CategoryNavItem>
                  );
                })
              )}
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
        width={400}
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
          <Form.Item
            name="parentId"
            label={t("categories.parentCategory")}
            extra={
              <Text type="secondary">{t("categories.parentCategoryHint")}</Text>
            }
          >
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
