import { Form, Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { OrderDetails } from "@/features/orders/model/order.types";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TranslationFn } from "../order-details-content.types";
import {
  buildWaybillInitialValues,
  buildWaybillPayload,
  getWaybillDescriptionFallback,
  hasNovaPoshtaDeliveryRefs,
  type WaybillFormValues,
} from "../utils/nova-poshta-waybill.utils";

type UseNovaPoshtaWaybillParams = {
  order: OrderDetails;
  t: TranslationFn;
  onCreateNovaPoshtaWaybill: (
    payload: ReturnType<typeof buildWaybillPayload>,
  ) => Promise<void>;
  onRemoveNovaPoshtaWaybill: () => Promise<void>;
};

export const useNovaPoshtaWaybill = ({
  order,
  t,
  onCreateNovaPoshtaWaybill,
  onRemoveNovaPoshtaWaybill,
}: UseNovaPoshtaWaybillParams) => {
  const primaryDeliveryInfo = order.deliveryInfo;
  const notification = useNotification();
  const [waybillForm] = Form.useForm<WaybillFormValues>();
  const [waybillActionLoading, setWaybillActionLoading] = useState(false);
  const waybillInitialValues = useMemo(
    () => buildWaybillInitialValues(order, t),
    [order, t],
  );
  const deliveryStatus =
    primaryDeliveryInfo?.deliveryStatus ?? order.deliveryStatus;
  const hasTrackingNumber = Boolean(primaryDeliveryInfo?.trackingNumber);
  const deliveryShipped = deliveryStatus === "shipped";
  const canRemoveTracking =
    order.canRemoveTracking && (primaryDeliveryInfo?.canRemoveTracking ?? true);
  const createDisabledReason = (() => {
    if (deliveryShipped) {
      return t("orders.details.deliveryShippedLocked");
    }

    if (!primaryDeliveryInfo) {
      return t("orders.details.waybillMissingDelivery");
    }

    if (primaryDeliveryInfo.provider !== "nova_poshta") {
      return t("orders.details.waybillNovaPoshtaRequired");
    }

    if (order.items.length === 0) {
      return t("orders.details.waybillItemsRequired");
    }

    if (!hasNovaPoshtaDeliveryRefs(primaryDeliveryInfo)) {
      return t("orders.details.waybillRefsRequired");
    }

    return null;
  })();
  const removeDisabledReason = deliveryShipped
    ? t("orders.details.deliveryShippedLocked")
    : !canRemoveTracking
      ? t("orders.details.removeWaybillUnavailable")
      : null;
  const canCreateWaybill = !hasTrackingNumber && createDisabledReason == null;
  const canRemoveWaybill = hasTrackingNumber && removeDisabledReason == null;

  useEffect(() => {
    waybillForm.setFieldsValue(waybillInitialValues);
  }, [waybillForm, waybillInitialValues]);

  const handleCreateWaybill = useCallback(async () => {
    if (!canCreateWaybill) {
      return;
    }

    const values = await waybillForm.validateFields();
    const payload = buildWaybillPayload(
      values,
      waybillInitialValues.description ??
        getWaybillDescriptionFallback(order, t),
    );

    setWaybillActionLoading(true);

    try {
      await onCreateNovaPoshtaWaybill(payload);
      notification.success({
        title: t("orders.details.createWaybillSuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.createWaybillFailed"),
        ),
      });
    } finally {
      setWaybillActionLoading(false);
    }
  }, [
    canCreateWaybill,
    notification,
    onCreateNovaPoshtaWaybill,
    order,
    t,
    waybillForm,
    waybillInitialValues.description,
  ]);

  const handleRemoveWaybill = useCallback(() => {
    if (!canRemoveWaybill) {
      return;
    }

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
  }, [canRemoveWaybill, notification, onRemoveNovaPoshtaWaybill, t]);

  return {
    primaryDeliveryInfo,
    waybillForm,
    waybillInitialValues,
    waybillActionLoading,
    hasTrackingNumber,
    deliveryShipped,
    createDisabledReason,
    removeDisabledReason,
    canCreateWaybill,
    canRemoveWaybill,
    handleCreateWaybill,
    handleRemoveWaybill,
  };
};
