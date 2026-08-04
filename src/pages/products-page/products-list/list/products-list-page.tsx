import { CubeIcon } from "@phosphor-icons/react";
import { Button, Flex, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getProductEditPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";
import { ProductInventoryDrawer } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer";
import type {
  Product,
  ProductVariant,
} from "@/features/products/model/product.types";
import { buildProductsListEditState } from "@/features/products/model/products-list-url";
import { isArchivedStatus } from "@/features/products/utils/product-display";

import { ProductArchiveModal } from "./components/product-archive-modal";
import { ProductHardDeleteModal } from "./components/product-hard-delete-modal";
import { ProductsListVariantCard } from "./components/products-list-variant-card";
import { useProductListLifecycleModals } from "./components/use-product-list-lifecycle-modals";

import { ProductsListActiveFilters } from "./products-list-active-filters";
import { ProductsListFiltersPanel } from "./products-list-filters-panel";
import { ProductsListToolbar } from "./products-list-toolbar";
import { ProductsTablePagination } from "./products-table-pagination";
import { useProductsListController } from "../controllers/use-products-list-controller";
import { useProductsListUrlSync } from "./use-products-list-url-sync";
import { useProductsTableColumns } from "./use-products-table-columns";
import { ProductsListGrid } from "./products-list-grid";
import * as S from "./products-list-page.styled";

const { Text } = Typography;

type InventoryDrawerSelection = {
  product: Product;
  targetVariantId: number | null;
  focusId: number;
};

export const ProductsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockSupplyModalOpen, setStockSupplyModalOpen] = useState(false);
  const {
    productsStore,
    categoryNameById,
    showInventoryQuantity,
    showInventoryManagement,
    handleDeleteById,
    handleDeleteVariant,
    handleArchiveProduct,
    handleUnarchiveProduct,
    handleArchiveVariant,
    handleUnarchiveVariant,
  } = useProductsListController();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const [inventoryDrawerSelection, setInventoryDrawerSelection] =
    useState<InventoryDrawerSelection | null>(null);
  const inventoryDrawerProduct = inventoryDrawerSelection?.product ?? null;
  const lifecycleModals = useProductListLifecycleModals({
    deleteLoadingId: productsStore.deleteLoadingId,
    deleteLoadingVariantId: productsStore.deleteLoadingVariantId,
    archiveLoadingId: productsStore.archiveLoadingId,
    archiveLoadingVariantId: productsStore.archiveLoadingVariantId,
    onDeleteProduct: handleDeleteById,
    onDeleteVariant: handleDeleteVariant,
    onArchiveProduct: handleArchiveProduct,
    onArchiveVariant: handleArchiveVariant,
  });

  useProductsListUrlSync(productsStore);

  const handleOpenProduct = useCallback(
    (productId: number, focusVariantId?: number) => {
      const product = productsStore.products.find(
        (item) => item.id === productId,
      );
      if (product != null && isArchivedStatus(product.status)) {
        return;
      }

      navigate(getProductEditPath(productId), {
        state: buildProductsListEditState(location.search, focusVariantId),
      });
    },
    [location.search, navigate, productsStore.products],
  );

  const handleUnarchiveProductClick = useCallback(
    (product: Product) => {
      void handleUnarchiveProduct(product.id);
    },
    [handleUnarchiveProduct],
  );

  const handleUnarchiveVariantClick = useCallback(
    (product: Product, variant: ProductVariant) => {
      void handleUnarchiveVariant(product.id, variant.id);
    },
    [handleUnarchiveVariant],
  );

  const handleToggleRowExpand = useCallback((productId: number) => {
    setExpandedRowKeys((prev) =>
      prev.includes(productId)
        ? prev.filter((key) => key !== productId)
        : [...prev, productId],
    );
  }, []);

  const handleTableRowExpand = useCallback(
    (expanded: boolean, product: Product) => {
      setExpandedRowKeys((prev) =>
        expanded
          ? prev.includes(product.id)
            ? prev
            : [...prev, product.id]
          : prev.filter((key) => key !== product.id),
      );
    },
    [],
  );

  const handleOpenInventoryDrawer = useCallback(
    (product: Product, targetVariantId: number | null = null) => {
      if (isArchivedStatus(product.status)) {
        return;
      }

      if (targetVariantId != null) {
        const variant = product.variants?.find(
          (item) => item.id === targetVariantId,
        );
        if (variant != null && isArchivedStatus(variant.status)) {
          return;
        }
      }

      setInventoryDrawerSelection((current) => ({
        product,
        targetVariantId,
        focusId: (current?.focusId ?? 0) + 1,
      }));
    },
    [],
  );

  const handleOpenVariantInventory = useCallback(
    (product: Product, variantId: number) => {
      handleOpenInventoryDrawer(product, variantId);
    },
    [handleOpenInventoryDrawer],
  );

  const handleCloseInventoryDrawer = useCallback(() => {
    setInventoryDrawerSelection(null);
  }, []);

  const columns = useProductsTableColumns({
    categoryNameById,
    deleteLoadingId: productsStore.deleteLoadingId,
    archiveLoadingId: productsStore.archiveLoadingId,
    expandedRowKeys,
    showInventoryQuantity,
    showInventoryManagement,
    onToggleRowExpand: handleToggleRowExpand,
    onOpenInventory: handleOpenInventoryDrawer,
    onEdit: handleOpenProduct,
    onArchive: lifecycleModals.requestArchiveProduct,
    onUnarchive: handleUnarchiveProductClick,
    onDelete: lifecycleModals.requestDeleteProduct,
  });

  const renderExpandedRow = useCallback(
    (product: Product) => {
      if (!product.variants?.length) {
        return (
          <Text type="secondary" style={{ display: "block", padding: 16 }}>
            {t("products.table.noVariants")}
          </Text>
        );
      }

      return (
        <Flex vertical gap={4} style={{ paddingLeft: "5%" }}>
          {product.variants.map((variant) => (
            <ProductsListVariantCard
              key={variant.id}
              product={product}
              variant={variant}
              showInventoryQuantity={showInventoryQuantity}
              showInventoryManagement={showInventoryManagement}
              deleteLoading={
                productsStore.deleteLoadingVariantId === variant.id
              }
              archiveLoading={
                productsStore.archiveLoadingVariantId === variant.id
              }
              onOpenInventory={handleOpenVariantInventory}
              onEdit={handleOpenProduct}
              onArchive={lifecycleModals.requestArchiveVariant}
              onUnarchive={handleUnarchiveVariantClick}
              onDelete={lifecycleModals.requestDeleteVariant}
            />
          ))}
        </Flex>
      );
    },
    [
      handleOpenProduct,
      handleOpenVariantInventory,
      handleUnarchiveVariantClick,
      lifecycleModals.requestArchiveVariant,
      lifecycleModals.requestDeleteVariant,
      productsStore.archiveLoadingVariantId,
      productsStore.deleteLoadingVariantId,
      showInventoryManagement,
      showInventoryQuantity,
      t,
    ],
  );

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-products-list-header">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <PaneSectionTitle>{t("products.listTitle")}</PaneSectionTitle>
          <Flex align="center" gap={8} wrap="wrap">
            <Button
              icon={<CubeIcon size={16} />}
              data-qa="products-list-add-supply"
              onClick={() => setStockSupplyModalOpen(true)}
            >
              {t("products.addSupplyCta")}
            </Button>
            <Button
              type="primary"
              onClick={() => navigate(pagesMap.productsListAdd)}
            >
              {t("products.addProductCta")}
            </Button>
          </Flex>
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
              <S.ProductsTableWrapper>
                <Table<Product>
                  rowKey="id"
                  columns={columns}
                  dataSource={productsStore.products}
                  loading={productsStore.listLoading}
                  pagination={false}
                  rowClassName={(product) => {
                    const classes: string[] = [];

                    if (
                      (product.variants?.length ?? 0) > 0 &&
                      expandedRowKeys.includes(product.id)
                    ) {
                      classes.push("product-row-expanded");
                    }

                    if (isArchivedStatus(product.status)) {
                      classes.push("product-row-archived");
                    }

                    return classes.join(" ");
                  }}
                  scroll={{ x: "max-content" }}
                  expandable={{
                    showExpandColumn: false,
                    expandedRowRender: renderExpandedRow,
                    rowExpandable: (product) =>
                      (product.variants?.length ?? 0) > 0,
                    expandedRowKeys,
                    onExpand: handleTableRowExpand,
                    expandRowByClick: false,
                  }}
                />
              </S.ProductsTableWrapper>
            ) : (
              <ProductsListGrid
                products={productsStore.products}
                loading={productsStore.listLoading}
                categoryNameById={categoryNameById}
                onOpenProduct={handleOpenProduct}
                onArchive={lifecycleModals.requestArchiveProduct}
                onUnarchive={handleUnarchiveProductClick}
                onDelete={lifecycleModals.requestDeleteProduct}
                deleteLoadingId={productsStore.deleteLoadingId}
                archiveLoadingId={productsStore.archiveLoadingId}
                showInventoryQuantity={showInventoryQuantity}
                showInventoryManagement={showInventoryManagement}
                onOpenInventory={handleOpenInventoryDrawer}
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
        <StockSupplyModal
          open={stockSupplyModalOpen}
          onClose={() => setStockSupplyModalOpen(false)}
          onSuccess={() => productsStore.loadProducts({ silent: true })}
        />
        <ProductInventoryDrawer
          open={showInventoryManagement && inventoryDrawerProduct != null}
          product={inventoryDrawerProduct}
          targetVariantId={inventoryDrawerSelection?.targetVariantId ?? null}
          targetVariantFocusId={inventoryDrawerSelection?.focusId ?? 0}
          onClose={handleCloseInventoryDrawer}
          onOpenProduct={handleOpenProduct}
        />
        <ProductHardDeleteModal
          open={lifecycleModals.hardDeleteTarget != null}
          target={lifecycleModals.hardDeleteTarget}
          loading={lifecycleModals.hardDeleteLoading}
          onCancel={lifecycleModals.closeHardDeleteModal}
          onConfirm={lifecycleModals.confirmHardDelete}
        />
        <ProductArchiveModal
          open={lifecycleModals.archiveTarget != null}
          target={lifecycleModals.archiveTarget}
          loading={lifecycleModals.archiveLoading}
          onCancel={lifecycleModals.closeArchiveModal}
          onConfirm={lifecycleModals.confirmArchive}
        />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
