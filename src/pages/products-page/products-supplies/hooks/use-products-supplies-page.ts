import { useCallback, useEffect, useState } from "react";

import { inventoryApi } from "@/features/inventory/api/inventory-api";
import {
  STOCK_SUPPLIES_DEFAULT_LIMIT,
  type GetStockSuppliesParams,
  type InventoryHistorySupplyItem,
  type StockSuppliesResponse,
  type StockSupplyListBy,
  type StockSupplyListItem,
} from "@/features/inventory/model/inventory.types";
import { useEnsureWorkspaceMembersLoaded } from "@/features/workspace-members/model/use-ensure-workspace-members-loaded";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { toInventoryHistorySupplyItem } from "../products-supplies.utils";
import {
  countSuppliesPanelFilters,
  EMPTY_SUPPLIES_PANEL_FILTERS,
  EMPTY_SUPPLIES_STATUS_COUNTS,
  SUPPLIES_STATUS_TABS,
  type SuppliesPanelFilters,
  type SuppliesStatusCounts,
} from "../supplies-filters.constants";

export type { SuppliesStatusCounts };

const buildSuppliesQueryParams = (
  page: number,
  pageSize: number,
  by: StockSupplyListBy,
  filters: SuppliesPanelFilters,
): GetStockSuppliesParams => ({
  by,
  limit: pageSize,
  offset: (page - 1) * pageSize,
  ...(filters.createdFrom ? { createdFrom: filters.createdFrom } : {}),
  ...(filters.createdTo ? { createdTo: filters.createdTo } : {}),
  ...(filters.createdBy != null ? { createdBy: filters.createdBy } : {}),
  ...(filters.totalSumFrom != null
    ? { totalSumFrom: filters.totalSumFrom }
    : {}),
  ...(filters.totalSumTo != null ? { totalSumTo: filters.totalSumTo } : {}),
});

export const useProductsSuppliesPage = () => {
  useEnsureWorkspaceMembersLoaded();
  const workspaceMembersStore = useWorkspaceMembersStore();

  const [data, setData] = useState<StockSuppliesResponse | null>(null);
  const [statusCounts, setStatusCounts] = useState<SuppliesStatusCounts>(
    EMPTY_SUPPLIES_STATUS_COUNTS,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [by, setBy] = useState<StockSupplyListBy>("all");
  const [appliedFilters, setAppliedFilters] = useState<SuppliesPanelFilters>(
    EMPTY_SUPPLIES_PANEL_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<SuppliesPanelFilters>(
    EMPTY_SUPPLIES_PANEL_FILTERS,
  );
  const [reloadToken, setReloadToken] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockSupplyModalOpen, setStockSupplyModalOpen] = useState(false);
  const [editingSupplyId, setEditingSupplyId] = useState<number | null>(null);
  const [selectedSupply, setSelectedSupply] =
    useState<InventoryHistorySupplyItem | null>(null);

  const pageSize = STOCK_SUPPLIES_DEFAULT_LIMIT;
  const appliedFilterCount = countSuppliesPanelFilters(appliedFilters);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const beginLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void inventoryApi
      .listStockSupplies(
        buildSuppliesQueryParams(page, pageSize, by, appliedFilters),
      )
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setStatusCounts((current) => ({
          ...current,
          [by]: response.total,
        }));
        setError(null);
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        setError(unknownErrorMessage(fetchError));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, by, page, pageSize, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all(
      SUPPLIES_STATUS_TABS.map((tab) =>
        inventoryApi.listStockSupplies(
          buildSuppliesQueryParams(1, 1, tab, appliedFilters),
        ),
      ),
    )
      .then((responses) => {
        if (cancelled) {
          return;
        }

        setStatusCounts(
          Object.fromEntries(
            SUPPLIES_STATUS_TABS.map((tab, index) => [
              tab,
              responses[index]?.total ?? 0,
            ]),
          ) as SuppliesStatusCounts,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setStatusCounts(EMPTY_SUPPLIES_STATUS_COUNTS);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, reloadToken]);

  const onPageChange = useCallback(
    (nextPage: number) => {
      beginLoading();
      setPage(nextPage);
    },
    [beginLoading],
  );

  const onByChange = useCallback(
    (nextBy: StockSupplyListBy) => {
      beginLoading();
      setBy(nextBy);
      setPage(1);
    },
    [beginLoading],
  );

  const openFilters = useCallback(() => {
    setDraftFilters({ ...appliedFilters });
    setFiltersOpen(true);
  }, [appliedFilters]);

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
  }, []);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(EMPTY_SUPPLIES_PANEL_FILTERS);
  }, []);

  const applyDraftFilters = useCallback(() => {
    beginLoading();
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }, [beginLoading, draftFilters]);

  const reload = useCallback(() => {
    beginLoading();
    setReloadToken((current) => current + 1);
  }, [beginLoading]);

  const openSupplyDetails = useCallback((supply: StockSupplyListItem) => {
    if (supply.status !== "applied") {
      setEditingSupplyId(supply.id);
      setStockSupplyModalOpen(true);
      return;
    }

    setSelectedSupply(toInventoryHistorySupplyItem(supply));

    if (supply.items.length > 0) {
      return;
    }

    const supplyId = supply.id;

    void inventoryApi
      .getStockSupply(supplyId)
      .then((detail) => {
        setSelectedSupply((current) =>
          current?.id === supplyId
            ? toInventoryHistorySupplyItem(detail)
            : current,
        );
      })
      .catch(() => undefined);
  }, []);

  const closeSupplyDetails = useCallback(() => {
    setSelectedSupply(null);
  }, []);

  const openStockSupplyModal = useCallback(() => {
    setEditingSupplyId(null);
    setStockSupplyModalOpen(true);
  }, []);

  const closeStockSupplyModal = useCallback(() => {
    setStockSupplyModalOpen(false);
    setEditingSupplyId(null);
  }, []);

  return {
    items,
    total,
    statusCounts,
    loading,
    error,
    page,
    pageSize,
    by,
    appliedFilterCount,
    showInitialSpinner:
      loading &&
      items.length === 0 &&
      !error &&
      by === "all" &&
      appliedFilterCount === 0,
    members: workspaceMembersStore.members,
    draftFilters,
    setDraftFilters,
    filtersOpen,
    openFilters,
    closeFilters,
    resetDraftFilters,
    applyDraftFilters,
    stockSupplyModalOpen,
    editingSupplyId,
    openStockSupplyModal,
    closeStockSupplyModal,
    selectedSupply,
    openSupplyDetails,
    closeSupplyDetails,
    onPageChange,
    onByChange,
    reload,
  };
};
