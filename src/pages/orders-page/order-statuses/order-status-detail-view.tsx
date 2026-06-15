import { Alert, Button, Flex, Form, message, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import * as S from "@/components/layout/form-card.styled";
import type { OrderStatusUpdatePayload } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { formatOrderStatusName } from "@/features/orders/utils/format-order-status-name";

import {
  OrderStatusFormFields,
  type OrderStatusFormValues,
} from "./order-status-form-fields";

const { Title, Text } = Typography;

export const OrderStatusDetailView = observer(() => {
  const { t } = useTranslation();
  const { statusId } = useParams<{ statusId: string }>();
  const navigate = useNavigate();
  const store = useOrdersStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<OrderStatusFormValues>();

  const idNum = statusId != null ? Number(statusId) : NaN;

  const status = useMemo(
    () =>
      Number.isFinite(idNum)
        ? store.statuses.find((s) => s.id === idNum)
        : undefined,
    [store.statuses, idNum],
  );

  useEffect(() => {
    if (status) {
      form.setFieldsValue({
        name: status.name,
        color: status.color,
        isDefault: status.isDefault,
      });
    }
  }, [form, status]);

  const handleSave = useCallback(async () => {
    if (!status) return;

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
      isDefault: values.isDefault === true,
    };

    try {
      await store.updateStatus(status.id, payload);
      messageApi.success(t("orderStatuses.updated"));
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("orderStatuses.updateError")));
    }
  }, [form, messageApi, status, store, t]);

  if (!Number.isFinite(idNum)) {
    return (
      <Alert type="error" message={t("orderStatuses.invalidStatus")} showIcon />
    );
  }

  if (store.statusesLoading && !status) {
    return <Spin style={{ marginTop: 24 }} />;
  }

  if (!store.statusesLoading && !status) {
    return (
      <Alert
        type="warning"
        message={t("orderStatuses.notFoundTitle")}
        description={t("orderStatuses.notFoundDescription")}
        showIcon
        action={
          <Button
            size="small"
            onClick={() => navigate(pagesMap.ordersStatuses)}
          >
            {t("orderStatuses.backToStatuses")}
          </Button>
        }
      />
    );
  }

  if (!status) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset data-qa="layout-order-status-detail">
        <PaneDetailLayout.Header data-qa="layout-order-status-detail-header">
          <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
            <Flex vertical gap={4}>
              <Title level={4} style={{ margin: 0 }}>
                {formatOrderStatusName(
                  status.name,
                  status.isDefault,
                  t("orderStatuses.defaultLabel"),
                )}
              </Title>
              <Text type="secondary">{t("orderStatuses.editHint")}</Text>
            </Flex>
            <Button
              type="primary"
              loading={store.statusSaveLoading}
              onClick={() => void handleSave()}
              style={{ flexShrink: 0 }}
            >
              {t("orderStatuses.saveChanges")}
            </Button>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-order-status-detail-body">
          <S.FormCard>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <OrderStatusFormFields
                statuses={store.statuses}
                editingStatusId={status.id}
              />
            </Form>
          </S.FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
