import {
  Alert,
  Button,
  Descriptions,
  Flex,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCategoryPath, pagesMap } from "@/app/router/pages-map";
import {
  categoriesEligibleAsParent,
  findCategoryById,
  flattenCategories,
} from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { fromNow } from "@/utils/date-time";

const { Title, Text } = Typography;

type CategoryEditFormValues = {
  name: string;
  parentId: number | null;
};

export const ProductCategoryDetailView = observer(() => {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const store = useCategoriesStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<CategoryEditFormValues>();

  const idNum = categoryId != null ? Number(categoryId) : NaN;

  const categoryFromList = useMemo(
    () =>
      Number.isFinite(idNum)
        ? findCategoryById(store.categories, idNum)
        : undefined,
    [idNum, store.categories],
  );

  const category = useMemo(() => {
    if (categoryFromList) {
      return categoryFromList;
    }

    if (store.activeCategory?.id === idNum) {
      return store.activeCategory;
    }

    return undefined;
  }, [categoryFromList, idNum, store.activeCategory]);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      return;
    }

    if (!categoryFromList) {
      void store.loadCategoryById(idNum);
    }
  }, [categoryFromList, idNum, store]);

  useEffect(() => {
    if (!category) {
      return;
    }

    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId,
    });
  }, [category, form]);

  const parentOptions = useMemo(
    () =>
      categoriesEligibleAsParent(
        store.categories,
        Number.isFinite(idNum) ? idNum : undefined,
      ).map((item) => ({ value: item.id, label: item.name })),
    [store.categories, idNum],
  );

  const handleSave = useCallback(async () => {
    if (!category) {
      return;
    }

    let values: CategoryEditFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    try {
      await store.updateCategory(category.id, values);
      messageApi.success(t("categories.updated"));
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("categories.updateFailed")));
    }
  }, [category, form, messageApi, store, t]);

  const pickNavigateAfterDelete = useCallback(() => {
    const sorted = flattenCategories(store.categories).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    const idx = sorted.findIndex((item) => item.id === idNum);
    const next = sorted[idx + 1] ?? sorted[idx - 1];

    if (next) {
      navigate(getProductCategoryPath(next.id));
      return;
    }

    navigate(pagesMap.productsCategories);
  }, [idNum, navigate, store.categories]);

  const handleDelete = useCallback(async () => {
    if (!category) {
      return;
    }

    try {
      await store.deleteCategory(category.id);
      messageApi.success(t("categories.deleted"));
      pickNavigateAfterDelete();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("categories.deleteFailed")));
    }
  }, [category, messageApi, pickNavigateAfterDelete, store, t]);

  if (!Number.isFinite(idNum)) {
    return <Alert type="error" message={t("categories.invalidId")} showIcon />;
  }

  if ((store.listLoading || store.detailLoading) && !category) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  if (!store.listLoading && !store.detailLoading && !category) {
    return (
      <Alert
        type="warning"
        title={t("categories.notFoundTitle")}
        description={t("categories.notFoundDescription")}
        showIcon
        action={
          <Button
            size="small"
            onClick={() => navigate(pagesMap.productsCategories)}
          >
            {t("categories.backToList")}
          </Button>
        }
      />
    );
  }

  if (!category) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root>
        <PaneDetailLayout.Header>
          <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
            <Flex vertical gap={4}>
              <Title level={4} style={{ margin: 0 }}>
                {category.name}
              </Title>
              <Text type="secondary">{t("categories.detailSubtitle")}</Text>
              <Text italic type="secondary">
                {t("categories.metaLine", {
                  userId: category.createdByUserId,
                  created: fromNow(category.createdAt),
                  updated: fromNow(category.updatedAt),
                })}
              </Text>
            </Flex>
            <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
              <Button
                type="primary"
                loading={store.saveLoading}
                onClick={() => void handleSave()}
              >
                {t("categories.saveChanges")}
              </Button>
              <Popconfirm
                title={t("categories.deleteConfirm")}
                description={t("categories.deleteWarning")}
                okText={t("categories.delete")}
                okButtonProps={{ danger: true }}
                onConfirm={handleDelete}
              >
                <Button danger loading={store.deleteLoadingId === category.id}>
                  {t("categories.delete")}
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body>
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 520 }}
            onFinish={handleSave}
          >
            <Form.Item
              name="name"
              label={t("categories.name")}
              rules={[
                { required: true, message: t("categories.nameRequired") },
                { max: 120, message: t("categories.nameTooLong") },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="parentId" label={t("categories.parentCategory")}>
              <Select
                allowClear
                placeholder={t("categories.noParent")}
                options={parentOptions}
              />
            </Form.Item>
          </Form>

          <Descriptions
            title={t("categories.contentTitle")}
            bordered
            column={1}
            size="small"
            style={{ marginTop: 24, maxWidth: 720 }}
          >
            <Descriptions.Item label={t("categories.subcategories")}>
              {category.children.length === 0 ? (
                t("categories.noSubcategories")
              ) : (
                <Flex gap={4}>
                  {category.children.map((child) => (
                    <Tag key={child.id}>{child.name}</Tag>
                  ))}
                </Flex>
              )}
            </Descriptions.Item>
          </Descriptions>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
