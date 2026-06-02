import { Button, Flex, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getProductEditPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import type { Product } from "@/features/products/model/product.types";

import { ProductsListActiveFilters } from "./products-list-active-filters";
import { ProductsListFiltersPanel } from "./products-list-filters-panel";
import { ProductsListToolbar } from "./products-list-toolbar";
import { ProductsTablePagination } from "./products-table-pagination";
import { useProductsListController } from "../controllers/use-products-list-controller";
import { useProductsListUrlSync } from "./use-products-list-url-sync";
import { useProductsTableColumns } from "./use-products-table-columns";
import { ProductsListGrid } from "./products-list-grid";

const { Text } = Typography;

export const ProductsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { productsStore, categoryNameById, rowSelection, handleDeleteById } =
    useProductsListController();

  useProductsListUrlSync(productsStore);

  const handleOpenProduct = useCallback(
    (productId: number) => {
      navigate(getProductEditPath(productId), {
        state: { productsListSearch: location.search },
      });
    },
    [location.search, navigate],
  );

  const handleProductRowClick = useCallback(
    (product: Product) => {
      return (event: MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;

        if (
          target.closest(".ant-checkbox-wrapper") ||
          target.closest(".ant-checkbox") ||
          target.closest("button") ||
          target.closest("a")
        ) {
          return;
        }

        handleOpenProduct(product.id);
      };
    },
    [handleOpenProduct],
  );

  const columns = useProductsTableColumns({
    categoryNameById,
    deleteLoadingId: productsStore.deleteLoadingId,
    onEdit: handleOpenProduct,
    onDelete: (productId) => handleDeleteById(productId),
  });

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-products-list-header">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <PaneSectionTitle>{t("products.listTitle")}</PaneSectionTitle>
          <Button
            type="primary"
            onClick={() => navigate(pagesMap.productsListAdd)}
          >
            {t("products.addProductCta")}
          </Button>
        </Flex>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-products-table-scroll">
        <Flex gap={24} align="flex-start" wrap="wrap">
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <ProductsListToolbar onToggleFilters={() => setFiltersOpen(true)} />
            <ProductsListActiveFilters categoryNameById={categoryNameById} />
            {productsStore.listError && (
              <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
                {productsStore.listError}
              </Text>
            )}
            {productsStore.listViewMode === "list" ? (
              <Table<Product>
                rowKey="id"
                columns={columns}
                dataSource={productsStore.products}
                rowSelection={rowSelection}
                loading={productsStore.listLoading}
                pagination={false}
                onRow={(product) => ({
                  onClick: handleProductRowClick(product),
                  style: { cursor: "pointer" },
                })}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <ProductsListGrid
                products={productsStore.products}
                loading={productsStore.listLoading}
                categoryNameById={categoryNameById}
                onOpenProduct={handleProductRowClick}
                onEdit={handleOpenProduct}
                onDelete={(productId) => handleDeleteById(productId)}
                deleteLoadingId={productsStore.deleteLoadingId}
              />
            )}
            <ProductsTablePagination
              current={productsStore.currentPage}
              pageSize={productsStore.pageSize}
              total={productsStore.total}
              onChange={(page) => {
                productsStore.setListPage(page);
              }}
            />
          </div>
        </Flex>
        <ProductsListFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
