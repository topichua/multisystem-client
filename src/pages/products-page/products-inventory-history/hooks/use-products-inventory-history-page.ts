import { useCallback, useEffect, useState } from "react";

import { inventoryApi } from "@/features/inventory/api/inventory-api";
import {
  INVENTORY_HISTORY_MOVEMENTS_DEFAULT_LIMIT,
  type GetInventoryHistoryMovementsParams,
  type InventoryHistoryMovementsResponse,
} from "@/features/inventory/model/inventory.types";
import { useEnsureWorkspaceMembersLoaded } from "@/features/workspace-members/model/use-ensure-workspace-members-loaded";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import {
  countInventoryHistoryPanelFilters,
  EMPTY_INVENTORY_HISTORY_PANEL_FILTERS,
  type InventoryHistoryPanelFilters,
} from "../inventory-history-filters.constants";

function buildHistoryQueryParams(
  page: number,
  pageSize: number,
  keyword: string,
  filters: InventoryHistoryPanelFilters,
): GetInventoryHistoryMovementsParams {
  const trimmedKeyword = keyword.trim();

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
    ...(filters.userId != null ? { userId: filters.userId } : {}),
  };
}

export function useProductsInventoryHistoryPage() {
  useEnsureWorkspaceMembersLoaded();
  const [data, setData] = useState<InventoryHistoryMovementsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<InventoryHistoryPanelFilters>(
      EMPTY_INVENTORY_HISTORY_PANEL_FILTERS,
    );
  const [draftFilters, setDraftFilters] =
    useState<InventoryHistoryPanelFilters>(
      EMPTY_INVENTORY_HISTORY_PANEL_FILTERS,
    );

  const pageSize = INVENTORY_HISTORY_MOVEMENTS_DEFAULT_LIMIT;
  const appliedFilterCount = countInventoryHistoryPanelFilters(appliedFilters);

  useEffect(() => {
    let cancelled = false;

    void inventoryApi
      .listHistoryMovements(
        buildHistoryQueryParams(page, pageSize, keyword, appliedFilters),
      )
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setError(null);
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        setError(unknownErrorMessage(fetchError));
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, keyword, page, pageSize]);

  const handlePageChange = useCallback((nextPage: number) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  }, []);

  const handleKeywordChange = useCallback((nextKeyword: string) => {
    setLoading(true);
    setError(null);
    setKeyword(nextKeyword);
    setPage(1);
  }, []);

  const syncDraftFiltersFromApplied = useCallback(() => {
    setDraftFilters({ ...appliedFilters });
  }, [appliedFilters]);

  const resetDraftFilters = useCallback(() => {
    setDraftFilters(EMPTY_INVENTORY_HISTORY_PANEL_FILTERS);
  }, []);

  const applyDraftFilters = useCallback(() => {
    setLoading(true);
    setError(null);
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }, [draftFilters]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    page,
    pageSize,
    keyword,
    appliedFilterCount,
    draftFilters,
    setDraftFilters,
    onPageChange: handlePageChange,
    onKeywordChange: handleKeywordChange,
    syncDraftFiltersFromApplied,
    resetDraftFilters,
    applyDraftFilters,
  };
}
