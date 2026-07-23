import { useCallback, useEffect, useState } from "react";

import { ordersApi } from "@/features/orders/api/orders-api";
import type {
  OrderDeliveryPayload,
  OrderDeliveryTrackingPayload,
  OrderDetails,
  OrderManualPaymentPayload,
  OrderNovaPoshtaWaybillPayload,
  OrderOnlinePaymentPayload,
  OrderRefundApprovePayload,
  OrderRefundCreatePayload,
  OrderUpdatePayload,
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

  const updateDelivery = useCallback(
    async (payload: OrderDeliveryPayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.updateDelivery(orderId, payload);
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const attachDeliveryTracking = useCallback(
    async (payload: OrderDeliveryTrackingPayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.attachDeliveryTracking(
        orderId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const updateOrder = useCallback(
    async (payload: OrderUpdatePayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.updateOrder(orderId, payload);
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const createManualPayment = useCallback(
    async (payload: OrderManualPaymentPayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.createManualPayment(
        orderId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const createOnlinePayment = useCallback(
    async (payload: OrderOnlinePaymentPayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.createOnlinePayment(
        orderId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const confirmPaymentTransaction = useCallback(
    async (transactionId: number): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.confirmPaymentTransaction(
        orderId,
        transactionId,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const deletePayment = useCallback(
    async (paymentId: number): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.deletePayment(orderId, paymentId);
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const createOrderRefund = useCallback(
    async (payload: OrderRefundCreatePayload): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.createOrderRefund(
        orderId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const approveOrderRefund = useCallback(
    async (
      refundId: number,
      payload: OrderRefundApprovePayload = {},
    ): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.approveOrderRefund(
        orderId,
        refundId,
        payload,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const deleteOrderRefund = useCallback(
    async (refundId: number): Promise<void> => {
      if (orderId == null) {
        return;
      }

      const updatedOrder = await ordersStore.deleteOrderRefund(
        orderId,
        refundId,
      );
      setOrder(updatedOrder);
    },
    [orderId, ordersStore],
  );

  const refreshOrder = useCallback(async (): Promise<void> => {
    if (orderId == null) {
      return;
    }

    const updatedOrder = await ordersStore.reloadOrder(orderId);
    setOrder(updatedOrder);
  }, [orderId, ordersStore]);

  return {
    order,
    loading,
    error,
    applyOrderStatusLocally,
    createNovaPoshtaWaybill,
    removeNovaPoshtaWaybill,
    updateDelivery,
    attachDeliveryTracking,
    updateOrder,
    createManualPayment,
    createOnlinePayment,
    confirmPaymentTransaction,
    deletePayment,
    createOrderRefund,
    approveOrderRefund,
    deleteOrderRefund,
    refreshOrder,
  };
};
