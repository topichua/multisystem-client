import { useCallback, useEffect, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { ClientOrderStats } from "@/features/orders/model/order.types";
import { throwLoadError } from "@/utils/throw-load-error";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export function useClientOrderStatsQuery(clientId: number | null) {
  const [stats, setStats] = useState<ClientOrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (clientId == null) {
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ordersApi.getClientOrderStats(clientId);

        if (!cancelled) {
          setStats(response);
        }
      } catch (e) {
        if (!cancelled) {
          setStats(null);
          setError(unknownErrorMessage(e));
          throwLoadError(`Failed to load client ${clientId} order stats`, e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [clientId, reloadToken]);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    stats,
    loading,
    error,
    retry,
  };
}
