import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Card, Empty, Flex, Input, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { CreateCategoryModal } from "./components/create-category-modal";
import { ProductsCategoriesTree } from "./components/products-categories-tree";
import { useProductsCategoriesPageController } from "./controllers/use-products-categories-page-controller";

const { Text, Title } = Typography;

export const ProductsCategoriesPage = observer(() => {
  const { t } = useTranslation();
  const {
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
  } = useProductsCategoriesPageController();

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
