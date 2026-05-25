import { Button, Flex, Table, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { pagesMap } from '@/app/router/pages-map';
import { PaneDetailLayout } from '@/components/layout/pane-detail-layout';
import { PaneSectionTitle } from '@/components/layout/pane-frame';
import type { Product } from '@/features/products/model/product.types';

import { ProductsListActiveFilters } from './products-list-active-filters';
import { ProductsListFiltersPanel } from './products-list-filters-panel';
import { ProductsListGrid } from './products-list-grid';
import { ProductsListToolbar } from './products-list-toolbar';
import { ProductsTablePagination } from './products-table-pagination';
import { useProductsListController } from './use-products-list-controller';
import { useProductsListUrlSync } from './use-products-list-url-sync';
import { useProductsTableColumns } from './use-products-table-columns';

const { Text } = Typography;

export const ProductsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    contextHolder,
    productsStore,
    categoryNameById,
    rowSelection,
    handleDeleteById,
    handleOpenProduct,
    handleRowClick,
  } = useProductsListController();

  useProductsListUrlSync(productsStore);

  const columns = useProductsTableColumns({
    categoryNameById,
    deleteLoading: productsStore.deleteLoading,
    onEdit: handleOpenProduct,
    onDelete: (productId) => handleDeleteById(productId),
  });

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header data-qa="layout-products-list-header">
          <Flex justify="space-between" align="center" gap={16} wrap="wrap">
            <PaneSectionTitle>{t('products.listTitle')}</PaneSectionTitle>
            <Button type="primary" onClick={() => navigate(pagesMap.productsListAdd)}>
              {t('products.addProductCta')}
            </Button>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-products-table-scroll">
          <Flex gap={24} align="flex-start" wrap="wrap">
            <div style={{ flex: '1 1 360px', minWidth: 0 }}>
              <ProductsListToolbar onToggleFilters={() => setFiltersOpen((open) => !open)} />
              <ProductsListActiveFilters categoryNameById={categoryNameById} />
              {productsStore.listError && (
                <Text type="danger" style={{ display: 'block', marginBottom: 8 }}>
                  {productsStore.listError}
                </Text>
              )}
              {productsStore.listViewMode === 'list' ? (
                <Table<Product>
                  rowKey="id"
                  columns={columns}
                  dataSource={productsStore.products}
                  rowSelection={rowSelection}
                  loading={productsStore.listLoading}
                  pagination={false}
                  onRow={(record) => ({
                    onClick: handleRowClick(record),
                    style: { cursor: 'pointer' },
                  })}
                  scroll={{ x: 'max-content' }}
                />
              ) : (
                <ProductsListGrid
                  products={productsStore.products}
                  loading={productsStore.listLoading}
                  categoryNameById={categoryNameById}
                  onOpenProduct={handleRowClick}
                  onEdit={handleOpenProduct}
                  onDelete={(productId) => handleDeleteById(productId)}
                  deleteLoading={productsStore.deleteLoading}
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
            {filtersOpen ? (
              <div style={{ flex: '0 1 300px', width: '100%', maxWidth: 420 }}>
                <ProductsListFiltersPanel
                  open={filtersOpen}
                  onClose={() => setFiltersOpen(false)}
                />
              </div>
            ) : null}
          </Flex>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
