import { Modal } from "antd";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TranslationFn } from "../order-details-content.types";

type UseNovaPoshtaWaybillParams = {
  t: TranslationFn;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
};

export const useNovaPoshtaWaybill = ({
  t,
  onRemoveNovaPoshtaWaybill,
}: UseNovaPoshtaWaybillParams) => {
  const notification = useNotification();
  const [waybillActionLoading, setWaybillActionLoading] = useState(false);

  const handleRemoveWaybill = useCallback(() => {
    Modal.confirm({
      title: t("orders.details.removeWaybillConfirmTitle"),
      content: t("orders.details.removeWaybillConfirmText"),
      okText: t("orders.details.removeWaybillConfirmOk"),
      okType: "danger",
      cancelText: t("orders.details.cancel"),
      onOk: async () => {
        setWaybillActionLoading(true);

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
          setWaybillActionLoading(false);
        }
      },
    });
  }, [notification, onRemoveNovaPoshtaWaybill, t]);

  return {
    waybillActionLoading,
    handleRemoveWaybill,
  };
};
