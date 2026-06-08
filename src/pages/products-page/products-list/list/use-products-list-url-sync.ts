import { useLayoutEffect, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import type { ProductsStore } from "@/features/products/model/products-store";
import {
  parseProductsListUrlSearchParams,
  productsListAppliedUrlStateEquals,
  productsListUrlSearchStringCanonical,
  serializeProductsListUrlSearchParams,
} from "@/features/products/model/products-list-url";

export function useProductsListUrlSync(store: ProductsStore): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const listUrlBootstrapped = useRef(false);

  useLayoutEffect(() => {
    const parsed = parseProductsListUrlSearchParams(searchParams);
    const changed = store.assignListStateFromUrl(parsed);
    if (!listUrlBootstrapped.current) {
      listUrlBootstrapped.current = true;
      void store.loadProducts();
      return;
    }
    if (changed) {
      void store.loadProducts();
    }
  }, [searchParams, store]);

  useEffect(() => {
    const next = serializeProductsListUrlSearchParams(store.appliedUrlSnapshot);
    if (
      productsListUrlSearchStringCanonical(next) ===
      productsListUrlSearchStringCanonical(searchParams)
    ) {
      return;
    }
    const urlState = parseProductsListUrlSearchParams(searchParams);
    const storeAheadOfUrl = !productsListAppliedUrlStateEquals(
      store.appliedUrlSnapshot,
      urlState,
    );
    setSearchParams(next, { replace: true });
    if (listUrlBootstrapped.current && storeAheadOfUrl) {
      void store.loadProducts();
    }
  }, [
    searchParams,
    setSearchParams,
    store,
    store.listKeyword,
    store.listSort,
    store.listCategoryIds,
    store.listStatus,
    store.listMinPrice,
    store.listMaxPrice,
    store.page,
    store.pageSize,
    store.listViewMode,
  ]);
}
