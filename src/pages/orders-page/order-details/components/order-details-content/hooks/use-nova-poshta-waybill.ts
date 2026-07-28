import { Modal } from "antd";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TranslationFn } from "../order-details-content.types";

type UseNovaPoshtaWaybillParams = {
  t: TranslationFn;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
  onCreateDeliveryPayment: () => Promise<void>;
};

export const useNovaPoshtaWaybill = ({
  t,
  onRemoveNovaPoshtaWaybill,
  onCreateDeliveryPayment,
}: UseNovaPoshtaWaybillParams) => {
  const notification = useNotification();
  const [removeWaybillLoading, setRemoveWaybillLoading] = useState(false);
  const [syncPaymentLoading, setSyncPaymentLoading] = useState(false);

  const handleRemoveWaybill = useCallback(() => {
    Modal.confirm({
      title: t("orders.details.removeWaybillConfirmTitle"),
      content: t("orders.details.removeWaybillConfirmText"),
      okText: t("orders.details.removeWaybillConfirmOk"),
      okType: "danger",
      cancelText: t("orders.details.cancel"),
      onOk: async () => {
        setRemoveWaybillLoading(true);

        try {
          await onRemoveNovaPoshtaWaybill();
          notification.success({
            title: t("orders.details.removeWaybillSuccess"),
          });
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("orders.details.removeWaybillFailed"),
            ),
          });
          return Promise.reject(error);
        } finally {
          setRemoveWaybillLoading(false);
        }
      },
    });
  }, [notification, onRemoveNovaPoshtaWaybill, t]);

  const handleSyncPayment = useCallback(async () => {
    setSyncPaymentLoading(true);

    try {
      await onCreateDeliveryPayment();
      notification.success({
        title: t("orders.details.deliveryPaymentSyncSuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.deliveryPaymentSyncFailed"),
        ),
      });
    } finally {
      setSyncPaymentLoading(false);
    }
  }, [notification, onCreateDeliveryPayment, t]);

  return {
    removeWaybillLoading,
    syncPaymentLoading,
    handleRemoveWaybill,
    handleSyncPayment,
  };
};
