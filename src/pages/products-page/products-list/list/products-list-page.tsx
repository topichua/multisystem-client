import { CubeIcon } from "@phosphor-icons/react";
import { Button, Card, Flex, Table, Tooltip, Typography } from "antd";
// import { Tag } from "@/components/tag/tag";
import { observer } from "mobx-react-lite";
import { useCallback, useState, type Key, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getProductEditPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { ProductInventoryDrawer } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer";
import type { Product } from "@/features/products/model/product.types";
import {
  formatProductPrice,
  getVariantTitle,
  // variantStatusToColor,
} from "@/features/products/utils/product-display";

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
  const {
    productsStore,
    categoryNameById,
    rowSelection,
    showInventoryQuantity,
    showInventoryManagement,
    handleDeleteById,
  } = useProductsListController();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const [inventoryDrawerSelection, setInventoryDrawerSelection] =
    useState<InventoryDrawerSelection | null>(null);
  const inventoryDrawerProduct = inventoryDrawerSelection?.product ?? null;

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

  const handleDeleteProduct = useCallback(
    (productId: number) => handleDeleteById(productId),
    [handleDeleteById],
  );

  const handleOpenInventoryDrawer = useCallback(
    (product: Product, targetVariantId: number | null = null) => {
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
    expandedRowKeys,
    showInventoryQuantity,
    showInventoryManagement,
    onToggleRowExpand: handleToggleRowExpand,
    onOpenInventory: handleOpenInventoryDrawer,
    onEdit: handleOpenProduct,
    onDelete: handleDeleteProduct,
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
        <Flex vertical gap={8} style={{ paddingLeft: "5%" }}>
          {product.variants.map((variant) => {
            const title = getVariantTitle(variant);

            return (
              <Card
                key={variant.id}
                styles={{
                  body: {
                    padding: 12,
                  },
                }}
              >
                <Flex align="center" justify="space-between" gap={16}>
                  <Text strong style={{ flex: "1 1 auto", minWidth: 240 }}>
                    {title ||
                      `${t("products.variant.fallbackName")} #${variant.id}`}
                  </Text>

                  <Flex align="center" gap={24} style={{ flexShrink: 0 }}>
                    {/* <Tag color={variantStatusToColor(variant.status)}>
                      {variant.status}
                    </Tag> */}

                    <Text type="secondary" style={{ minWidth: 110 }}>
                      {variant.sku || "—"}
                    </Text>

                    <Text strong style={{ minWidth: 90 }}>
                      {formatProductPrice(variant.price, product.currency)}
                    </Text>

                    {showInventoryQuantity ? (
                      <Flex gap={8} align="center" style={{ minWidth: 80 }}>
                        <Text type="secondary">
                          {t("products.variant.quantity")}
                        </Text>
                        <Text
                          type={variant.quantity === 0 ? "danger" : undefined}
                          strong
                        >
                          {variant.quantity ?? "—"}
                        </Text>
                        {showInventoryManagement ? (
                          <Tooltip
                            title={t(
                              "products.inventoryDrawer.openVariantStockAria",
                            )}
                          >
                            <Button
                              type="text"
                              size="small"
                              icon={<CubeIcon size={16} />}
                              aria-label={t(
                                "products.inventoryDrawer.openVariantStockAria",
                              )}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenVariantInventory(product, variant.id);
                              }}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                            />
                          </Tooltip>
                        ) : null}
                      </Flex>
                    ) : null}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      );
    },
    [
      handleOpenVariantInventory,
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
              <S.ProductsTableWrapper>
                <Table<Product>
                  rowKey="id"
                  columns={columns}
                  dataSource={productsStore.products}
                  rowSelection={rowSelection}
                  loading={productsStore.listLoading}
                  pagination={false}
                  rowClassName={(product) =>
                    (product.variants?.length ?? 0) > 1 &&
                    expandedRowKeys.includes(product.id)
                      ? "product-row-expanded"
                      : ""
                  }
                  onRow={(product) => ({
                    onClick: handleProductRowClick(product),
                    style: { cursor: "pointer" },
                  })}
                  scroll={{ x: "max-content" }}
                  expandable={{
                    showExpandColumn: false,
                    expandedRowRender: renderExpandedRow,
                    rowExpandable: (product) =>
                      (product.variants?.length ?? 0) > 1,
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
                onOpenProduct={handleProductRowClick}
                onEdit={handleOpenProduct}
                onDelete={handleDeleteProduct}
                deleteLoadingId={productsStore.deleteLoadingId}
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
        <ProductInventoryDrawer
          open={showInventoryManagement && inventoryDrawerProduct != null}
          product={inventoryDrawerProduct}
          targetVariantId={inventoryDrawerSelection?.targetVariantId ?? null}
          targetVariantFocusId={inventoryDrawerSelection?.focusId ?? 0}
          onClose={handleCloseInventoryDrawer}
          onOpenProduct={handleOpenProduct}
        />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
