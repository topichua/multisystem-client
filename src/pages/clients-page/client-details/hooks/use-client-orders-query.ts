import { useCallback, useEffect, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export function useClientOrdersQuery(clientId: number | null) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (clientId == null) {
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ordersApi.getClientOrders(clientId, {
          page: 1,
          pageSize: 50,
        });

        if (!cancelled) {
          setOrders(response.items);
          setTotal(response.total);
        }
      } catch (e) {
        if (!cancelled) {
          setOrders([]);
          setTotal(0);
          setError(unknownErrorMessage(e));
          throwLoadError(`Failed to load client ${clientId} orders`, e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [clientId, reloadToken]);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    orders,
    total,
    loading,
    error,
    retry,
  };
}
