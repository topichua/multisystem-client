import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Empty, Flex, Spin, Table, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { InventoryHistorySupplyItem } from "@/features/inventory/model/inventory.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { ProductsTablePagination } from "@/pages/products-page/products-list/list/products-table-pagination";

import { useProductsInventoryHistoryPage } from "./hooks/use-products-inventory-history-page";
import { InventoryHistoryFiltersDrawer } from "./inventory-history-filters-drawer";
import { InventoryHistorySupplyDrawer } from "./inventory-history-supply-drawer";
import { InventoryHistoryToolbar } from "./inventory-history-toolbar";
import { getInventoryHistoryItemKey } from "./products-inventory-history.utils";
import { useInventoryHistoryTableColumns } from "./use-inventory-history-table-columns";

const { Text } = Typography;

export const ProductsInventoryHistoryPage = observer(() => {
  const { t } = useTranslation();
  const workspaceMembersStore = useWorkspaceMembersStore();
  const {
    items,
    total,
    loading,
    error,
    page,
    pageSize,
    keyword,
    appliedFilterCount,
    draftFilters,
    setDraftFilters,
    onPageChange,
    onKeywordChange,
    syncDraftFiltersFromApplied,
    resetDraftFilters,
    applyDraftFilters,
  } = useProductsInventoryHistoryPage();
  const [selectedSupply, setSelectedSupply] =
    useState<InventoryHistorySupplyItem | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const columns = useInventoryHistoryTableColumns({
    members: workspaceMembersStore.members,
    onOpenSupply: setSelectedSupply,
  });

  const showInitialSpinner =
    loading &&
    items.length === 0 &&
    !error &&
    !keyword &&
    appliedFilterCount === 0;

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-products-inventory-history-header">
        <PaneSectionTitle>
          {t("products.inventoryHistoryTitle")}
        </PaneSectionTitle>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-products-inventory-history-scroll">
        {showInitialSpinner ? (
          <CenteredSpinner />
        ) : (
          <Flex vertical gap={16} style={{ minHeight: 200 }}>
            <InventoryHistoryToolbar
              keyword={keyword}
              filterCount={appliedFilterCount}
              onKeywordChange={onKeywordChange}
              onOpenFilters={() => {
                syncDraftFiltersFromApplied();
                setFiltersOpen(true);
              }}
            />

            {error && (
              <Text type="danger" style={{ display: "block" }}>
                {error}
              </Text>
            )}

            <Spin spinning={loading}>
              {items.length === 0 ? (
                <Empty
                  description={t("products.inventoryHistory.emptyState")}
                  style={{ marginTop: 24 }}
                />
              ) : (
                <Table
                  rowKey={getInventoryHistoryItemKey}
                  columns={columns}
                  dataSource={items}
                  pagination={false}
                  scroll={{ x: 1100 }}
                />
              )}
            </Spin>

            <ProductsTablePagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={onPageChange}
            />
          </Flex>
        )}
      </PaneDetailLayout.Body>

      <InventoryHistoryFiltersDrawer
        open={filtersOpen}
        draftFilters={draftFilters}
        members={workspaceMembersStore.members}
        onClose={() => setFiltersOpen(false)}
        onDraftChange={setDraftFilters}
        onResetDraft={resetDraftFilters}
        onApply={applyDraftFilters}
      />

      <InventoryHistorySupplyDrawer
        open={selectedSupply != null}
        item={selectedSupply}
        onClose={() => setSelectedSupply(null)}
      />
    </PaneDetailLayout.Root>
  );
});
