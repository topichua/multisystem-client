import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Empty, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { CreateCategoryModal } from "../components/create-category-modal";
import { ProductsCategoriesTree } from "../components/products-categories-tree";
import { useProductsCategoriesPageController } from "../controllers/use-products-categories-page-controller";
import * as S from "./mobile-products-categories-page.styled";

export const MobileProductsCategoriesPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const emptyDescription =
    store.categories.length === 0
      ? t("categories.emptyState")
      : t("categories.emptySearch");

  return (
    <>
      <S.Root>
        <S.Header>
          <S.HeaderTopRow>
            <S.TitleRow>
              <S.BackButton
                type="text"
                icon={<ArrowLeftIcon size={20} />}
                aria-label={t("products.mobile.backToProductsAria")}
                data-qa="products-mobile-categories-back"
                onClick={() => navigate(pagesMap.products)}
              />
              <S.TitleCopy>
                <S.PageTitle level={3}>{t("categories.title")}</S.PageTitle>
                <S.PageSubtitle>
                  {t("categories.itemsCount", { count: categoriesCount })}
                </S.PageSubtitle>
              </S.TitleCopy>
            </S.TitleRow>

            <S.CreateButton
              type="primary"
              icon={<PlusIcon />}
              aria-label={t("categories.createCategory")}
              data-qa="products-mobile-categories-create"
              onClick={() => setCreateModalOpen(true)}
            >
              <S.CreateButtonLabel>
                {t("categories.createCategory")}
              </S.CreateButtonLabel>
            </S.CreateButton>
          </S.HeaderTopRow>

          <S.SearchInput
            allowClear
            placeholder={t("categories.searchPlaceholder")}
            aria-label={t("categories.searchPlaceholder")}
            value={searchValue}
            data-qa="products-mobile-categories-search"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </S.Header>

        {showInitialLoading ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : loadError && store.categories.length === 0 ? (
          <S.StateContainer>
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
          </S.StateContainer>
        ) : store.categories.length === 0 || visibleCategories.length === 0 ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          </S.StateContainer>
        ) : (
          <Spin spinning={store.listLoading}>
            <S.TreeCard>
              <ProductsCategoriesTree
                categories={visibleCategories}
                expandAll={searchActive}
              />
            </S.TreeCard>
          </Spin>
        )}
      </S.Root>

      <CreateCategoryModal
        open={createModalOpen}
        loading={createLoading}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateRootCategory}
      />
    </>
  );
});
