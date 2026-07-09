import { Form } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import type { OrderStatusUpdatePayload } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { OrderStatusFormValues } from "./order-status-form-fields";

export function useOrderStatusEditor(statusId: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useOrdersStore();
  const notification = useNotification();
  const [form] = Form.useForm<OrderStatusFormValues>();

  const idNum = statusId != null ? Number(statusId) : NaN;

  const status = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.statuses.find((item) => item.id === idNum)
        : undefined,
    [idNum, store.statuses],
  );

  useEffect(() => {
    if (status) {
      form.setFieldsValue({
        name: status.name,
        category: status.category,
        color: status.color,
      });
    }
  }, [form, status]);

  const handleSave = useCallback(async () => {
    if (!status) {
      return;
    }

    let values: OrderStatusFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload: OrderStatusUpdatePayload = {
      name: values.name,
      color:
        typeof values.color === "string" ? values.color : String(values.color),
      category: status.isSystem ? status.category : values.category,
      isDefault: status.isDefault,
    };

    try {
      await store.updateStatus(status.id, payload);
      notification.success({ title: t("orderStatuses.updated") });
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("orderStatuses.updateError")),
      });
    }
  }, [form, notification, status, store, t]);

  const handleDelete = useCallback(async () => {
    if (!status || status.isSystem) {
      return;
    }

    try {
      await store.deleteStatus(status.id);
      notification.success({ title: t("orderStatuses.deleted") });
      navigate(pagesMap.ordersStatuses);
    } catch (e) {
      notification.error({
        title: getApiErrorMessage(e, t("orderStatuses.deleteError")),
      });
    }
  }, [navigate, notification, status, store, t]);

  return {
    idNum,
    status,
    form,
    store,
    isInvalidId: !Number.isFinite(idNum),
    isLoading: store.statusesLoading && !status,
    isNotFound: !store.statusesLoading && !status,
    handleSave,
    handleDelete,
    navigateToStatuses: () => navigate(pagesMap.ordersStatuses),
  };
}
