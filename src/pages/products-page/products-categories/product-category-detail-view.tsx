import {
  Alert,
  Badge,
  Button,
  Divider,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCategoryPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  findCategoryById,
  flattenCategories,
} from "@/features/categories/model/category-tree";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { isCategoryDeleteHasChildrenError } from "@/features/categories/utils/category-delete-error";
import { formatDate } from "@/utils/date-time";

import * as S from "./product-category-detail-view.styled";

const { Title, Text } = Typography;

const SUBCATEGORY_NAME_MAX_LENGTH = 120;

export const ProductCategoryDetailView = observer(() => {
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

  const sortedChildren = useMemo(
    () =>
      [...(category?.children ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [category?.children],
  );

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      return;
    }

    if (!categoryFromList) {
      void store.loadCategoryById(idNum);
    }
  }, [categoryFromList, idNum, store]);

  useEffect(() => {
    if ((category?.children.length ?? 0) === 0) {
      setDeleteBlockedByApi(false);
    }
  }, [category?.children?.length]);

  const cancelRenameSubcategory = useCallback(() => {
    setRenamingSubcategoryId(null);
    setRenamingSubcategoryName("");
  }, []);

  const openAddSubcategory = useCallback(() => {
    cancelRenameSubcategory();
    setSubcategoryName("");
    setIsAddingSubcategory(true);
  }, [cancelRenameSubcategory]);

  const closeAddSubcategory = useCallback(() => {
    setIsAddingSubcategory(false);
    setSubcategoryName("");
  }, []);

  const openRenameSubcategory = useCallback(
    (childId: number, childName: string) => {
      closeAddSubcategory();
      setRenamingSubcategoryId(childId);
      setRenamingSubcategoryName(childName);
    },
    [closeAddSubcategory],
  );

  const handleCreateSubcategory = useCallback(async () => {
    if (!category) {
      return;
    }

    const name = subcategoryName.trim();

    if (!name) {
      messageApi.error(t("categories.nameRequired"));
      return;
    }

    if (name.length > SUBCATEGORY_NAME_MAX_LENGTH) {
      messageApi.error(t("categories.nameTooLong"));
      return;
    }

    try {
      await store.createCategory({
        name,
        parentId: category.id,
      });
      messageApi.success(t("categories.createSuccess"));
      closeAddSubcategory();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("categories.createFailed")));
    }
  }, [category, closeAddSubcategory, messageApi, store, subcategoryName, t]);

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

    setDeleteBlockedByApi(false);

    try {
      await store.deleteCategory(category.id);
      messageApi.success(t("categories.deleted"));
      pickNavigateAfterDelete();
    } catch (e) {
      if (isCategoryDeleteHasChildrenError(e)) {
        setDeleteBlockedByApi(true);
        return;
      }

      messageApi.error(getApiErrorMessage(e, t("categories.deleteFailed")));
    }
  }, [category, messageApi, pickNavigateAfterDelete, store, t]);

  const handleDeleteSubcategory = useCallback(
    async (childId: number) => {
      try {
        await store.deleteCategory(childId);
        if (renamingSubcategoryId === childId) {
          cancelRenameSubcategory();
        }
        messageApi.success(t("categories.deleted"));
      } catch (e) {
        messageApi.error(getApiErrorMessage(e, t("categories.deleteFailed")));
      }
    },
    [cancelRenameSubcategory, messageApi, renamingSubcategoryId, store, t],
  );

  const handleRenameSubcategory = useCallback(
    async (childId: number, parentId: number | null) => {
      const name = renamingSubcategoryName.trim();

      if (!name) {
        messageApi.error(t("categories.nameRequired"));
        return;
      }

      if (name.length > SUBCATEGORY_NAME_MAX_LENGTH) {
        messageApi.error(t("categories.nameTooLong"));
        return;
      }

      const currentChild = sortedChildren.find((child) => child.id === childId);

      if (currentChild?.name === name) {
        cancelRenameSubcategory();
        return;
      }

      try {
        await store.updateCategory(childId, { name, parentId });
        messageApi.success(t("categories.updated"));
        cancelRenameSubcategory();
      } catch (e) {
        messageApi.error(getApiErrorMessage(e, t("categories.updateFailed")));
      }
    },
    [
      cancelRenameSubcategory,
      messageApi,
      renamingSubcategoryName,
      sortedChildren,
      store,
      t,
    ],
  );

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

  const subcategoriesCount = category.children.length;
  const createdDate = formatDate(category.createdAt);

  return (
    <>
      {contextHolder}

      <PaneDetailLayout.Root>
        <PaneDetailLayout.Header>
          <Flex vertical gap={12}>
            <Title level={2} style={{ margin: 0 }}>
              {category.name}
            </Title>

            <Space size={8} separator={<Text type="secondary">·</Text>} wrap>
              <Text type="secondary">
                {t("categories.metaSubcategories", {
                  count: subcategoriesCount,
                })}
              </Text>

              <Text type="secondary">
                {t("categories.createdOn", { date: createdDate })}
              </Text>
            </Space>
          </Flex>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body>
          <Flex
            vertical
            gap={20}
            style={{ maxWidth: 780, margin: "20px auto" }}
          >
            <Flex justify="space-between" align="center" gap={16} wrap="wrap">
              <Space size={8} align="center">
                <Title level={5} style={{ margin: 0 }}>
                  {t("categories.subcategories")}
                </Title>
                <Badge
                  count={subcategoriesCount}
                  color="rgba(0, 0, 0, 0.06)"
                  style={{ color: "rgba(0, 0, 0, 0.65)" }}
                  showZero
                />
              </Space>

              {!isAddingSubcategory ? (
                <Button icon={<PlusIcon />} onClick={openAddSubcategory}>
                  {t("categories.addSubcategory")}
                </Button>
              ) : null}
            </Flex>

            {isAddingSubcategory ? (
              <S.AddSubcategoryRow>
                <Input
                  autoFocus
                  value={subcategoryName}
                  placeholder={t("categories.subcategoryNamePlaceholder")}
                  maxLength={SUBCATEGORY_NAME_MAX_LENGTH}
                  onChange={(event) => setSubcategoryName(event.target.value)}
                  onPressEnter={() => void handleCreateSubcategory()}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  loading={store.saveLoading}
                  onClick={() => void handleCreateSubcategory()}
                >
                  {t("categories.addSubcategorySubmit")}
                </Button>
                <Button onClick={closeAddSubcategory}>
                  {t("categories.addSubcategoryCancel")}
                </Button>
              </S.AddSubcategoryRow>
            ) : null}

            {sortedChildren.length > 0 ? (
              <Flex vertical>
                {sortedChildren.map((child, index) => (
                  <div key={child.id}>
                    {index > 0 ? <Divider style={{ margin: 0 }} /> : null}
                    <S.SubcategoryRow>
                      {renamingSubcategoryId === child.id ? (
                        <S.AddSubcategoryRow>
                          <Input
                            autoFocus
                            value={renamingSubcategoryName}
                            maxLength={SUBCATEGORY_NAME_MAX_LENGTH}
                            onChange={(event) =>
                              setRenamingSubcategoryName(event.target.value)
                            }
                            onPressEnter={() =>
                              void handleRenameSubcategory(
                                child.id,
                                child.parentId,
                              )
                            }
                            style={{ flex: 1 }}
                          />
                          <Button
                            type="primary"
                            loading={store.saveLoading}
                            onClick={() =>
                              void handleRenameSubcategory(
                                child.id,
                                child.parentId,
                              )
                            }
                          >
                            {t("categories.saveChanges")}
                          </Button>
                          <Button onClick={cancelRenameSubcategory}>
                            {t("categories.cancel")}
                          </Button>
                        </S.AddSubcategoryRow>
                      ) : (
                        <Flex
                          align="center"
                          justify="space-between"
                          gap={16}
                          style={{ width: "100%" }}
                        >
                          <Flex gap={2} vertical>
                            <Text strong>{child.name}</Text>
                            <Text
                              italic
                              type="secondary"
                              style={{ fontSize: 11 }}
                            >
                              {t("categories.createdOn", {
                                date: formatDate(child.createdAt),
                              })}
                            </Text>
                          </Flex>

                          <Space size={4}>
                            <Button
                              type="text"
                              icon={<PencilSimpleIcon size={18} />}
                              aria-label={t("categories.renameSubcategory")}
                              onClick={() =>
                                openRenameSubcategory(child.id, child.name)
                              }
                            />
                            <Popconfirm
                              title={t("categories.deleteConfirm")}
                              description={t("categories.deleteWarning")}
                              okText={t("categories.delete")}
                              okButtonProps={{ danger: true }}
                              onConfirm={() =>
                                void handleDeleteSubcategory(child.id)
                              }
                            >
                              <Button
                                type="text"
                                danger
                                icon={<TrashIcon />}
                                loading={store.deleteLoadingId === child.id}
                                aria-label={t("categories.delete")}
                              />
                            </Popconfirm>
                          </Space>
                        </Flex>
                      )}
                    </S.SubcategoryRow>
                  </div>
                ))}
              </Flex>
            ) : !isAddingSubcategory ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("categories.noSubcategories")}
              />
            ) : null}

            <Text type="secondary">
              {t("categories.deleteSubcategoryNote")}
            </Text>

            <Divider style={{ margin: 0 }} />

            {deleteBlockedByApi ? (
              <Alert
                type="error"
                showIcon
                title={t("categories.deleteBlockedHasChildrenTitle")}
                description={t("categories.deleteBlockedHasChildren")}
                closable
              />
            ) : null}

            <Popconfirm
              title={t("categories.deleteConfirm")}
              description={t("categories.deleteWarning")}
              okText={t("categories.delete")}
              okButtonProps={{ danger: true }}
              onConfirm={() => void handleDelete()}
            >
              <Button
                danger
                type="text"
                icon={<TrashIcon />}
                loading={store.deleteLoadingId === category.id}
                style={{ alignSelf: "flex-start", paddingInline: 0 }}
              >
                {t("categories.deleteCategory")}
              </Button>
            </Popconfirm>
          </Flex>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
