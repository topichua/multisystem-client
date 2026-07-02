import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Empty, Pagination, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getProductEditPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { useProductsListController } from "../../controllers/use-products-list-controller";
import { ProductsListActiveFilters } from "../products-list-active-filters";
import { ProductsListFiltersPanel } from "../products-list-filters-panel";
import { ProductsListToolbar } from "../products-list-toolbar";
import { useProductsListUrlSync } from "../use-products-list-url-sync";
import { MobileProductCard } from "./mobile-product-card";
import * as S from "./mobile-products-list-page.styled";

export const MobileProductsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    productsStore,
    categoryNameById,
    showInventoryQuantity,
    handleDeleteById,
  } = useProductsListController();

  useProductsListUrlSync(productsStore);

  const handleOpenProduct = useCallback(
    (productId: number) => {
      navigate(getProductEditPath(productId), {
        state: { productsListSearch: location.search },
      });
    },
    [location.search, navigate],
  );

  const handleDeleteProduct = useCallback(
    (productId: number) => handleDeleteById(productId),
    [handleDeleteById],
  );

  const showInitialLoader =
    productsStore.listLoading && productsStore.products.length === 0;

  return (
    <S.Root>
      <S.Header>
        <S.TitleCluster>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("products.mobile.backToProductsAria")}
            data-qa="products-mobile-list-back"
            onClick={() => navigate(pagesMap.products)}
          />
          <S.PageTitle level={3}>{t("products.listTitle")}</S.PageTitle>
        </S.TitleCluster>
        <S.CreateButton
          type="primary"
          icon={<PlusIcon size={16} />}
          aria-label={t("products.mobile.addProductAria")}
          data-qa="products-mobile-list-add"
          onClick={() => navigate(pagesMap.productsListAdd)}
        >
          <S.CreateButtonLabel>
            {t("products.addProductCta")}
          </S.CreateButtonLabel>
        </S.CreateButton>
      </S.Header>

      <S.ScrollRegion>
        <ProductsListToolbar onToggleFilters={() => setFiltersOpen(true)} />
        <ProductsListActiveFilters categoryNameById={categoryNameById} />
        {productsStore.listError ? (
          <S.ErrorText type="danger">{productsStore.listError}</S.ErrorText>
        ) : null}

        {showInitialLoader ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : productsStore.products.length === 0 &&
          !productsStore.listLoading ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("products.mobile.emptyProducts")}
            />
          </S.StateContainer>
        ) : (
          <Spin spinning={productsStore.listLoading}>
            <S.ProductList>
              {productsStore.products.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    product.categoryId != null
                      ? (categoryNameById.get(product.categoryId) ??
                        `#${product.categoryId}`)
                      : t("products.noCategory")
                  }
                  deleteLoading={productsStore.deleteLoadingId === product.id}
                  showInventoryQuantity={showInventoryQuantity}
                  onEdit={handleOpenProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </S.ProductList>
            {productsStore.total > productsStore.pageSize ? (
              <S.PaginationWrap>
                <Pagination
                  current={productsStore.currentPage}
                  pageSize={productsStore.pageSize}
                  total={productsStore.total}
                  showSizeChanger={false}
                  simple
                  onChange={(page) => {
                    productsStore.setListPage(page);
                  }}
                />
              </S.PaginationWrap>
            ) : null}
          </Spin>
        )}

        <ProductsListFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </S.ScrollRegion>
    </S.Root>
  );
});
