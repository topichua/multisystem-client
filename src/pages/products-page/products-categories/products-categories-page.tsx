import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Card, Empty, Flex, Input, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { CreateCategoryModal } from "./components/create-category-modal";
import { ProductsCategoriesTree } from "./components/products-categories-tree";
import {
  countCategoryTreeItems,
  filterCategoryTreeBySearch,
} from "./products-categories.utils";

const { Text, Title } = Typography;

export const ProductsCategoriesPage = observer(() => {
  const { t } = useTranslation();
  const store = useCategoriesStore();
  const notification = useNotification();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const loadCategories = useCallback(async () => {
    setLoadError(null);

    try {
      await store.loadCategories();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, t("categories.loadFailed")));
    }
  }, [store, t]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

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
  const showInitialLoading =
    store.listLoading && store.categories.length === 0 && !loadError;

  return (
    <>
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header data-qa="products-categories-header">
          <Flex vertical gap={12}>
            <Flex align="flex-start" justify="space-between" gap={16}>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {t("categories.title")}
                </Title>
                <Text type="secondary">
                  {t("categories.itemsCount", { count: categoriesCount })}
                </Text>
              </div>

              <Button
                type="primary"
                icon={<PlusIcon />}
                onClick={() => setCreateModalOpen(true)}
              >
                {t("categories.createCategory")}
              </Button>
            </Flex>

            <Input.Search
              allowClear
              placeholder={t("categories.searchPlaceholder")}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </Flex>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body data-qa="products-categories-scroll">
          {showInitialLoading ? (
            <CenteredSpinner />
          ) : loadError && store.categories.length === 0 ? (
            <Alert
              showIcon
              type="error"
              title={t("categories.loadFailed")}
              description={loadError}
              action={
                <Button size="small" onClick={() => void loadCategories()}>
                  {t("categories.retry")}
                </Button>
              }
            />
          ) : store.categories.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("categories.emptyState")}
            />
          ) : visibleCategories.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("categories.emptySearch")}
            />
          ) : (
            <Card>
              <ProductsCategoriesTree
                categories={visibleCategories}
                expandAll={searchActive}
              />
            </Card>
          )}
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <CreateCategoryModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateRootCategory}
      />
    </>
  );
});
