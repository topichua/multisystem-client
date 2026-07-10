import { useCallback, useEffect, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type {
  OrderDetails,
  OrderNovaPoshtaWaybillPayload,
} from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { throwLoadError } from "@/utils/throw-load-error";
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
          throwLoadError(`Failed to load order ${orderId}`, e);
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

  const createNovaPoshtaWaybill = useCallback(
    async (payload: OrderNovaPoshtaWaybillPayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.createNovaPoshtaWaybill(
        orderId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const removeNovaPoshtaWaybill = useCallback(async (): Promise<void> => {
    if (orderId == null) {
      return;
    }

    const updatedOrder = await ordersStore.removeNovaPoshtaWaybill(orderId);
    setOrder(updatedOrder);
  }, [orderId, ordersStore]);

  return {
    order,
    loading,
    error,
    applyOrderStatusLocally,
    createNovaPoshtaWaybill,
    removeNovaPoshtaWaybill,
  };
};
