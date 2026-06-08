import { useEffect, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "react-router";

import type { OrdersStore } from "@/features/orders/model/orders-store";
import {
  ordersListAppliedUrlStateEquals,
  ordersListUrlSearchStringCanonical,
  parseOrdersListUrlSearchParams,
  serializeOrdersListUrlSearchParams,
} from "@/features/orders/model/orders-list-url";

export function useOrdersListUrlSync(store: OrdersStore): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const listUrlBootstrapped = useRef(false);

  useLayoutEffect(() => {
    const parsed = parseOrdersListUrlSearchParams(searchParams);
    const changed = store.assignListStateFromUrl(parsed);
    if (!listUrlBootstrapped.current) {
      listUrlBootstrapped.current = true;
      void store.loadOrders();
      return;
    }
    if (changed) {
      void store.loadOrders();
    }
  }, [searchParams, store]);

  useEffect(() => {
    const next = serializeOrdersListUrlSearchParams(store.appliedUrlSnapshot);
    if (
      ordersListUrlSearchStringCanonical(next) ===
      ordersListUrlSearchStringCanonical(searchParams)
    ) {
      return;
    }
    const urlState = parseOrdersListUrlSearchParams(searchParams);
    const storeAheadOfUrl = !ordersListAppliedUrlStateEquals(
      store.appliedUrlSnapshot,
      urlState,
    );
    setSearchParams(next, { replace: true });
    if (listUrlBootstrapped.current && storeAheadOfUrl) {
      void store.loadOrders();
    }
  }, [
    searchParams,
    setSearchParams,
    store,
    store.listKeyword,
    store.listStatusIds,
    store.listSources,
    store.listTotalPriceFrom,
    store.listTotalPriceTo,
    store.listCreatedFrom,
    store.listCreatedTo,
    store.page,
    store.pageSize,
  ]);
}
