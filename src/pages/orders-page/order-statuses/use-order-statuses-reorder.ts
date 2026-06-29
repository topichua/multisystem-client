import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { OrderStatus } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { useNotification } from "@/shared/components/notification/use-notification";

export function useOrderStatusesReorder(sortedStatuses: OrderStatus[]) {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const notification = useNotification();

  return useCallback(
    async (ids: number[]) => {
      const currentIds = sortedStatuses.map((status) => status.id);
      if (
        ids.length === currentIds.length &&
        ids.every((id, index) => id === currentIds[index])
      ) {
        return;
      }

      try {
        await store.reorderStatuses(ids);
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("orderStatuses.reorderError")),
        });
      }
    },
    [notification, sortedStatuses, store, t],
  );
}
