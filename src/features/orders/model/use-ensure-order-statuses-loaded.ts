import { useEffect } from "react";

import { useOrdersStore } from "@/features/orders/model/use-orders-store";

export const useEnsureOrderStatusesLoaded = (): void => {
  const ordersStore = useOrdersStore();

  useEffect(() => {
    void ordersStore.loadStatuses();
  }, [ordersStore]);
};
