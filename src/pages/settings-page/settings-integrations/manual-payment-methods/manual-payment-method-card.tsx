import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Modal, Space, Tag, Typography } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  IntegrationItem,
  ManualPaymentMethodPayload,
} from "@/features/integrations/model/integration.types";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "../settings-integrations.styled";
import {
  ManualPaymentMethodForm,
  type ManualPaymentMethodFormValues,
} from "./manual-payment-method-form";

const { Text } = Typography;

type ManualPaymentMethodCardProps = {
  integration: IntegrationItem;
  onUpdated?: () => void;
};

function normalizeType(type: IntegrationItem["manualPaymentMethodType"]) {
  return type === "card" ? "card" : "iban";
}

export function ManualPaymentMethodCard({
  integration,
  onUpdated,
}: ManualPaymentMethodCardProps) {
  const { t } = useTranslation();
  const store = useIntegrationsStore();
  const notification = useNotification();
  const [form] = Form.useForm<ManualPaymentMethodFormValues>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const methodType = normalizeType(integration.manualPaymentMethodType);
  const displayValue =
    integration.manualPaymentDisplayValue ??
    integration.manualPaymentValue ??
    "";

  const openEdit = useCallback(() => {
    form.setFieldsValue({
      name: integration.name,
      type: methodType,
      value: integration.manualPaymentValue ?? displayValue,
    });
    setEditing(true);
  }, [
    displayValue,
    form,
    integration.manualPaymentValue,
    integration.name,
    methodType,
  ]);

  const cancelEdit = useCallback(() => {
    form.setFieldsValue({
      name: integration.name,
      type: methodType,
      value: integration.manualPaymentValue ?? displayValue,
    });
    setEditing(false);
  }, [
    displayValue,
    form,
    integration.manualPaymentValue,
    integration.name,
    methodType,
  ]);

  const handleSubmit = useCallback(
    async (payload: ManualPaymentMethodPayload) => {
      setSaving(true);

      try {
        await store.updateManualPaymentMethod(integration.id, payload);
        setEditing(false);
        notification.success({
          title: t("integrations.manualPayment.updateSuccess"),
        });
        onUpdated?.();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("integrations.manualPayment.updateFailed"),
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [integration.id, notification, onUpdated, store, t],
  );

  const handleDelete = useCallback(() => {
    Modal.confirm({
      title: t("integrations.manualPayment.deleteConfirmTitle"),
      content: t("integrations.manualPayment.deleteConfirmContent", {
        name: integration.name,
      }),
      okText: t("integrations.manualPayment.actions.delete"),
      okType: "danger",
      cancelText: t("integrations.manualPayment.actions.cancel"),
      onOk: async () => {
        setDeleting(true);

        try {
          await store.deleteManualPaymentMethod(integration.id);
          notification.success({
            title: t("integrations.manualPayment.deleteSuccess"),
          });
          onUpdated?.();
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("integrations.manualPayment.deleteFailed"),
            ),
          });
          return Promise.reject();
        } finally {
          setDeleting(false);
        }
      },
    });
  }, [integration.id, integration.name, notification, onUpdated, store, t]);

  if (editing) {
    return (
      <S.ManualPaymentMethodRow>
        <ManualPaymentMethodForm
          form={form}
          initialValues={{
            name: integration.name,
            type: methodType,
            value: integration.manualPaymentValue ?? displayValue,
          }}
          mode="edit"
          submitting={saving}
          onCancel={cancelEdit}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      </S.ManualPaymentMethodRow>
    );
  }

  return (
    <S.ManualPaymentMethodRow>
      <Flex align="center" justify="space-between" gap={16} flex={1} wrap>
        <Flex vertical gap={4} flex={1}>
          <Space size={8} wrap>
            <Text strong>{integration.name}</Text>
            <Tag style={{ marginInlineEnd: 0 }}>
              {t(`integrations.manualPayment.types.${methodType}`)}
            </Tag>
          </Space>
          <Text>
            {displayValue}
          </Text>
        </Flex>

        <Space>
          <Button
            type="text"
            icon={<PencilSimpleIcon />}
            aria-label={t("integrations.manualPayment.actions.edit")}
            onClick={openEdit}
          />
          <Button
            danger
            loading={deleting}
            icon={<TrashIcon />}
            aria-label={t("integrations.manualPayment.actions.delete")}
            onClick={handleDelete}
          />
        </Space>
      </Flex>
    </S.ManualPaymentMethodRow>
  );
}
