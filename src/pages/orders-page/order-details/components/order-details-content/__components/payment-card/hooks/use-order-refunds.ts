import { useCallback, useEffect, useRef, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { OrderRefund } from "@/features/orders/model/order.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

type UseOrderRefundsOptions = {
  orderId: number;
  enabled?: boolean;
};

type UseOrderRefundsResult = {
  refunds: OrderRefund[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<OrderRefund[]>;
};

type OrderScopedError = {
  orderId: number;
  message: string;
};

type OrderScopedRefunds = {
  orderId: number;
  refunds: OrderRefund[];
};

export function useOrderRefunds({
  orderId,
  enabled = true,
}: UseOrderRefundsOptions): UseOrderRefundsResult {
  const [state, setState] = useState<OrderScopedRefunds | null>(null);
  const [error, setError] = useState<OrderScopedError | null>(null);
  const requestIdRef = useRef(0);

  const fetchRefunds = useCallback(async (): Promise<OrderRefund[]> => {
    const requestId = ++requestIdRef.current;
    const requestedOrderId = orderId;

    try {
      const next = await ordersApi.listOrderRefunds(requestedOrderId);

      if (requestId !== requestIdRef.current) {
        return [];
      }

      const refunds = next.refunds ?? [];
      setState({ orderId: requestedOrderId, refunds });
      setError(null);
      return refunds;
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return [];
      }

      setError({
        orderId: requestedOrderId,
        message: unknownErrorMessage(loadError),
      });
      return [];
    }
  }, [orderId]);

  const refresh = useCallback(() => fetchRefunds(), [fetchRefunds]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const requestedOrderId = orderId;

    const load = async () => {
      try {
        const next = await ordersApi.listOrderRefunds(requestedOrderId);

        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          orderId: requestedOrderId,
          refunds: next.refunds ?? [],
        });
        setError(null);
      } catch (loadError) {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setError({
          orderId: requestedOrderId,
          message: unknownErrorMessage(loadError),
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, orderId]);

  const activeRefunds = state?.orderId === orderId ? state.refunds : [];
  const activeError = error?.orderId === orderId ? error.message : null;
  const loading = Boolean(
    enabled && state?.orderId !== orderId && activeError == null,
  );

  return {
    refunds: activeRefunds,
    loading,
    error: activeError,
    refresh,
  };
}
