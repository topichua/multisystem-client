import { useCallback, useEffect, useRef, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { OrderPaymentsSummary } from "@/features/orders/model/order.types";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import { hasPendingOnlinePayments } from "../lib/payment-transaction.utils";

const POLL_INTERVAL_MS = 5000;

type UseOrderPaymentsOptions = {
  orderId: number;
  enabled?: boolean;
  onSettledChange?: () => void;
};

type UseOrderPaymentsResult = {
  summary: OrderPaymentsSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<OrderPaymentsSummary | null>;
};

type OrderScopedError = {
  orderId: number;
  message: string;
};

export function useOrderPayments({
  orderId,
  enabled = true,
  onSettledChange,
}: UseOrderPaymentsOptions): UseOrderPaymentsResult {
  const [summary, setSummary] = useState<OrderPaymentsSummary | null>(null);
  const [error, setError] = useState<OrderScopedError | null>(null);
  const hadPendingRef = useRef(false);
  const onSettledChangeRef = useRef(onSettledChange);
  const requestIdRef = useRef(0);

  useEffect(() => {
    onSettledChangeRef.current = onSettledChange;
  }, [onSettledChange]);

  const applySummary = useCallback((next: OrderPaymentsSummary) => {
    const hadPending = hadPendingRef.current;
    const hasPending = hasPendingOnlinePayments(next.payments ?? []);

    hadPendingRef.current = hasPending;
    setSummary(next);
    setError(null);

    if (hadPending && !hasPending) {
      onSettledChangeRef.current?.();
    }
  }, []);

  const fetchPayments =
    useCallback(async (): Promise<OrderPaymentsSummary | null> => {
      const requestId = ++requestIdRef.current;
      const requestedOrderId = orderId;

      try {
        const next = await ordersApi.listOrderPayments(requestedOrderId);

        if (requestId !== requestIdRef.current) {
          return null;
        }

        applySummary(next);
        return next;
      } catch (loadError) {
        if (requestId !== requestIdRef.current) {
          return null;
        }

        setError({
          orderId: requestedOrderId,
          message: unknownErrorMessage(loadError),
        });
        return null;
      }
    }, [applySummary, orderId]);

  const refresh = useCallback(() => fetchPayments(), [fetchPayments]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const requestedOrderId = orderId;

    hadPendingRef.current = false;

    const load = async () => {
      try {
        const next = await ordersApi.listOrderPayments(requestedOrderId);

        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        applySummary(next);
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
  }, [applySummary, enabled, orderId]);

  const activeSummary = summary?.orderId === orderId ? summary : null;
  const activeError = error?.orderId === orderId ? error.message : null;
  const loading = Boolean(
    enabled && activeSummary == null && activeError == null,
  );

  const shouldPoll =
    enabled &&
    activeSummary != null &&
    hasPendingOnlinePayments(activeSummary.payments ?? []);

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void fetchPayments();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [shouldPoll, fetchPayments]);

  return {
    summary: activeSummary,
    loading,
    error: activeError,
    refresh,
  };
}
