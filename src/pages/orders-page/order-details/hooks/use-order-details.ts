import { useCallback, useEffect, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type { OrderDetails } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

export const useOrderDetails = (orderId: number | null) => {
  const ordersStore = useOrdersStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (orderId == null) return;

    let cancelled = false;

    const loadOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await ordersApi.getById(orderId);

        if (!cancelled) {
          setOrder(data);
        }
      } catch (e) {
        if (!cancelled) {
          setOrder(null);
          setError(unknownErrorMessage(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const applyOrderStatusLocally = useCallback(
    (nextStatusId: number) => {
      setOrder((currentOrder) => {
        if (!currentOrder || currentOrder.statusId === nextStatusId) {
          return currentOrder;
        }

        const nextStatus =
          ordersStore.statusById.get(nextStatusId) ?? currentOrder.status;

        return {
          ...currentOrder,
          statusId: nextStatusId,
          status: nextStatus,
        };
      });
    },
    [ordersStore.statusById],
  );

  return {
    order,
    loading,
    error,
    applyOrderStatusLocally,
  };
};
