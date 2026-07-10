import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCategoriesStore } from "@/features/categories/model/use-categories-store";
import type { CatalogSearchMode } from "@/features/orders/model/orders-store";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";

import {
  CATALOG_SEARCH_DEBOUNCE_MS,
  MIN_CATALOG_SEARCH_LENGTH,
} from "./catalog-product-search.constants";
import type {
  UseCatalogProductSearchOptions,
  VariantSelectOption,
} from "./catalog-product-search.types";
import { flattenCategoriesForSelect } from "./category-select.utils";

export function useCatalogProductSearch({
  debounceMs = CATALOG_SEARCH_DEBOUNCE_MS,
  defaultCategoryId = null,
  defaultMode = "flat",
  enabled = true,
  loadCategories = false,
  minSearchLength = MIN_CATALOG_SEARCH_LENGTH,
}: UseCatalogProductSearchOptions = {}) {
  const ordersStore = useOrdersStore();
  const categoriesStore = useCategoriesStore();
  const categoryLoadRequestedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    defaultCategoryId,
  );
  const [catalogSearchMode, setCatalogSearchMode] =
    useState<CatalogSearchMode>(defaultMode);
  const [productPickerKey, setProductPickerKey] = useState(0);
  const trimmedSearch = searchQuery.trim();

  useEffect(() => {
    if (!loadCategories) {
      return;
    }

    if (
      categoryLoadRequestedRef.current ||
      categoriesStore.categories.length > 0
    ) {
      return;
    }

    categoryLoadRequestedRef.current = true;
    void categoriesStore.loadCategories().catch(() => undefined);
  }, [categoriesStore, categoriesStore.categories.length, loadCategories]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (trimmedSearch.length < minSearchLength) {
      ordersStore.clearCatalogSearch();
      return;
    }

    const timer = window.setTimeout(() => {
      void ordersStore
        .searchCatalog({
          keyword: trimmedSearch,
          categoryId: selectedCategoryId,
          mode: catalogSearchMode,
        })
        .catch(() => undefined);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [
    catalogSearchMode,
    debounceMs,
    enabled,
    minSearchLength,
    ordersStore,
    selectedCategoryId,
    trimmedSearch,
  ]);

  const categorySelectOptions = useMemo(
    () => flattenCategoriesForSelect(categoriesStore.categories),
    [categoriesStore.categories],
  );

  const variantSelectOptions = useMemo<VariantSelectOption[]>(
    () =>
      ordersStore.catalogSearchResults.map((variant) => ({
        value: variant.id,
        label: variant.label,
        variant,
      })),
    [ordersStore.catalogSearchResults],
  );

  const variantsById = useMemo(
    () =>
      new Map(
        ordersStore.catalogSearchResults.map((variant) => [
          variant.id,
          variant,
        ]),
      ),
    [ordersStore.catalogSearchResults],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (value.trim().length < minSearchLength) {
        ordersStore.clearCatalogSearch();
      }
    },
    [minSearchLength, ordersStore],
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    ordersStore.clearCatalogSearch();
  }, [ordersStore]);

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSearchModeChange = useCallback((mode: CatalogSearchMode) => {
    setCatalogSearchMode(mode);
  }, []);

  const bumpProductPickerKey = useCallback(() => {
    setProductPickerKey((key) => key + 1);
  }, []);

  const reset = useCallback(() => {
    setSearchQuery("");
    setSelectedCategoryId(defaultCategoryId);
    setCatalogSearchMode(defaultMode);
    ordersStore.clearCatalogSearch();
    setProductPickerKey((key) => key + 1);
  }, [defaultCategoryId, defaultMode, ordersStore]);

  const getVariantById = useCallback(
    (variantId: number): CatalogVariant | undefined =>
      variantsById.get(variantId),
    [variantsById],
  );

  return {
    catalogSearchLoading: ordersStore.catalogSearchLoading,
    catalogSearchMode,
    catalogSearchProductGroups: ordersStore.catalogSearchProductGroups,
    catalogSearchResults: ordersStore.catalogSearchResults,
    categoriesLoading: categoriesStore.listLoading,
    categorySelectOptions,
    minSearchLength,
    productPickerKey,
    searchQuery,
    selectedCategoryId,
    trimmedSearch,
    variantSelectOptions,
    bumpProductPickerKey,
    getVariantById,
    handleCategoryChange,
    handleClear,
    handleSearch,
    handleSearchModeChange,
    reset,
  };
}
