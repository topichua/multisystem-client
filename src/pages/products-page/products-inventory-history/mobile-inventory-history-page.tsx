import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Empty, Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { InventoryHistorySupplyItem } from "@/features/inventory/model/inventory.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { ProductsTablePagination } from "@/pages/products-page/products-list/list/products-table-pagination";

import { useProductsInventoryHistoryPage } from "./hooks/use-products-inventory-history-page";
import { InventoryHistoryFiltersDrawer } from "./inventory-history-filters-drawer";
import { InventoryHistoryMobileCard } from "./inventory-history-mobile-card";
import { InventoryHistorySupplyDrawer } from "./inventory-history-supply-drawer";
import { InventoryHistoryToolbar } from "./inventory-history-toolbar";
import { getInventoryHistoryItemKey } from "./products-inventory-history.utils";
import * as S from "./mobile-inventory-history-page.styled";

export const MobileInventoryHistoryPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const memberByUserId = useMemo(
    () =>
      new Map(
        workspaceMembersStore.members.map((member) => [member.user.id, member]),
      ),
    [workspaceMembersStore.members],
  );

  const showInitialSpinner =
    loading && items.length === 0 && !error && !keyword && appliedFilterCount === 0;

  return (
    <S.Root>
      <S.Header>
        <S.TitleRow>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("products.mobile.backToProductsAria")}
            data-qa="products-mobile-inventory-history-back"
            onClick={() => navigate(pagesMap.products)}
          />
          <S.PageTitle level={3}>
            {t("products.inventoryHistoryTitle")}
          </S.PageTitle>
        </S.TitleRow>
      </S.Header>

      {showInitialSpinner ? (
        <S.Content>
          <CenteredSpinner />
        </S.Content>
      ) : (
        <Flex vertical gap={12}>
          <InventoryHistoryToolbar
            keyword={keyword}
            filterCount={appliedFilterCount}
            onKeywordChange={onKeywordChange}
            onOpenFilters={() => {
              syncDraftFiltersFromApplied();
              setFiltersOpen(true);
            }}
          />

          {error ? <S.ErrorText type="danger">{error}</S.ErrorText> : null}

          <Spin spinning={loading}>
            {items.length === 0 ? (
              <Empty description={t("products.inventoryHistory.emptyState")} />
            ) : (
              <Flex vertical gap={12}>
                {items.map((item) => (
                  <InventoryHistoryMobileCard
                    key={getInventoryHistoryItemKey(item)}
                    item={item}
                    memberByUserId={memberByUserId}
                    onOpenSupply={setSelectedSupply}
                  />
                ))}
              </Flex>
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
    </S.Root>
  );
});
