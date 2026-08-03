import { CubeIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Spin, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { ProductsTablePagination } from "@/pages/products-page/products-list/list/products-table-pagination";

import { useProductsSuppliesPage } from "./hooks/use-products-supplies-page";
import { SuppliesPageOverlays } from "./supplies-page-overlays";
import { SuppliesToolbar } from "./supplies-toolbar";
import { useSuppliesTableColumns } from "./use-supplies-table-columns";

const { Text } = Typography;

export const ProductsSuppliesPage = observer(() => {
  const { t } = useTranslation();
  const page = useProductsSuppliesPage();
  const columns = useSuppliesTableColumns();

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-products-supplies-header">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <PaneSectionTitle>{t("products.suppliesTitle")}</PaneSectionTitle>
          <Button
            icon={<CubeIcon size={16} />}
            data-qa="products-supplies-add-supply"
            onClick={page.openStockSupplyModal}
          >
            {t("products.addSupplyCta")}
          </Button>
        </Flex>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-products-supplies-scroll">
        {page.showInitialSpinner ? (
          <CenteredSpinner />
        ) : (
          <Flex vertical gap={16} style={{ minHeight: 200 }}>
            <SuppliesToolbar
              by={page.by}
              statusCounts={page.statusCounts}
              filterCount={page.appliedFilterCount}
              onByChange={page.onByChange}
              onOpenFilters={page.openFilters}
            />

            {page.error && (
              <Text type="danger" style={{ display: "block" }}>
                {page.error}
              </Text>
            )}

            <Spin spinning={page.loading}>
              {page.items.length === 0 ? (
                <Empty
                  description={t("products.supplies.emptyState")}
                  style={{ marginTop: 24 }}
                />
              ) : (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={page.items}
                  pagination={false}
                  scroll={{ x: 1100 }}
                />
              )}
            </Spin>

            <ProductsTablePagination
              current={page.page}
              pageSize={page.pageSize}
              total={page.total}
              onChange={page.onPageChange}
            />
          </Flex>
        )}
      </PaneDetailLayout.Body>

      <SuppliesPageOverlays
        filtersOpen={page.filtersOpen}
        draftFilters={page.draftFilters}
        members={page.members}
        onCloseFilters={page.closeFilters}
        onDraftChange={page.setDraftFilters}
        onResetDraft={page.resetDraftFilters}
        onApplyFilters={page.applyDraftFilters}
        stockSupplyModalOpen={page.stockSupplyModalOpen}
        onCloseStockSupplyModal={page.closeStockSupplyModal}
        onStockSupplySuccess={page.reload}
      />
    </PaneDetailLayout.Root>
  );
});
