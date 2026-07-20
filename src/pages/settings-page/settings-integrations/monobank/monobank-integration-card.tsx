import { ClockIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Button, Col, Flex, Form, Row, Space, Typography } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import MonobankLogoIcon from "@/components/icons/monobank-logo/monobank.svg?react";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  IntegrationItem,
  MonobankIntegrationPayload,
} from "@/features/integrations/model/integration.types";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { formatDateTime } from "@/utils/date-time";

import * as S from "../settings-integrations.styled";
import {
  MonobankIntegrationForm,
  type MonobankIntegrationFormValues,
} from "./monobank-integration-form";

const { Text } = Typography;

type DetailFieldProps = {
  label: string;
  value?: string | null;
  fallback: string;
  danger?: boolean;
};

type MonobankIntegrationCardProps = {
  integration: IntegrationItem;
  layout?: "desktop" | "mobile";
  onUpdated?: () => void;
};

function DetailField({ label, value, fallback, danger }: DetailFieldProps) {
  const displayValue = value?.trim() || fallback;

  return (
    <Flex vertical gap={4}>
      <Text type="secondary">{label}</Text>
      <Text type={danger ? "danger" : undefined}>{displayValue}</Text>
    </Flex>
  );
}

function DetailColumn(props: DetailFieldProps) {
  return (
    <Col xs={24} md={12}>
      <DetailField {...props} />
    </Col>
  );
}

export function MonobankIntegrationCard({
  integration,
  layout = "desktop",
  onUpdated,
}: MonobankIntegrationCardProps) {
  const { t } = useTranslation();
  const store = useIntegrationsStore();
  const notification = useNotification();
  const [form] = Form.useForm<MonobankIntegrationFormValues>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMobile = layout === "mobile";
  const displayName = integration.displayName ?? integration.name;
  const emptyValue = t("integrations.monobankDetails.emptyValue");
  const statusLabel =
    integration.status === "connected"
      ? t("integrations.monobankDetails.status.connected")
      : (integration.status ??
        t("integrations.monobankDetails.status.unknown"));

  const openEdit = useCallback(() => {
    form.setFieldsValue({
      displayName,
      merchantToken: "",
    });
    setEditing(true);
  }, [displayName, form]);

  const cancelEdit = useCallback(() => {
    form.setFieldsValue({
      displayName,
      merchantToken: "",
    });
    setEditing(false);
  }, [displayName, form]);

  const handleSubmit = useCallback(
    async (payload: MonobankIntegrationPayload) => {
      setSaving(true);

      try {
        await store.updateMonobankIntegration(integration.id, payload);
        setEditing(false);
        notification.success({
          title: t("integrations.monobankDetails.updateSuccess"),
        });
        onUpdated?.();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("integrations.monobankDetails.updateFailed"),
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [integration.id, notification, onUpdated, store, t],
  );

  const statusRow = (
    <S.MobileIntegrationAccountStatusRow>
      {integration.status === "connected" ? (
        <S.IntegrationConnectedStatus>
          {t("integrations.connectedTag")}
        </S.IntegrationConnectedStatus>
      ) : (
        <Text type="secondary">{statusLabel}</Text>
      )}
      {integration.connectedAt && (
        <Flex align="center" gap={4}>
          <ClockIcon />
          <Text type="secondary">
            {formatDateTime(integration.connectedAt)}
          </Text>
        </Flex>
      )}
    </S.MobileIntegrationAccountStatusRow>
  );

  const details = (
    <Row gutter={[24, 12]}>
      <DetailColumn
        label={t("integrations.monobankDetails.fields.merchantToken")}
        value={integration.credentialsMasked}
        fallback={emptyValue}
      />
      <DetailColumn
        label={t("integrations.monobankDetails.fields.status")}
        value={statusLabel}
        fallback={emptyValue}
      />
      <DetailColumn
        label={t("integrations.monobankDetails.fields.lastConnectionCheck")}
        value={
          integration.lastConnectionCheckAt
            ? formatDateTime(integration.lastConnectionCheckAt)
            : null
        }
        fallback={emptyValue}
      />
      {integration.lastError && (
        <DetailColumn
          label={t("integrations.monobankDetails.fields.lastError")}
          value={integration.lastError}
          fallback={emptyValue}
          danger
        />
      )}
    </Row>
  );

  const cardContent = (
    <Flex vertical gap={16} flex={1}>
      <Flex align="flex-start" justify="space-between" gap={16} wrap>
        <Flex align="flex-start" gap={12} flex={1}>
          <Flex vertical gap={8} flex={1}>
            <MonobankLogoIcon width={100} />
            <Text strong>{displayName}</Text>
            {statusRow}
          </Flex>
        </Flex>

        <Space wrap>
          <Button
            type="text"
            icon={<PencilSimpleIcon />}
            disabled={editing}
            aria-label={t("integrations.monobankDetails.editAction")}
            onClick={openEdit}
          />
        </Space>
      </Flex>

      {editing ? (
        <MonobankIntegrationForm
          form={form}
          initialValues={{ displayName }}
          mode="edit"
          submitting={saving}
          onCancel={cancelEdit}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : (
        details
      )}
    </Flex>
  );

  if (isMobile) {
    return (
      <S.MobileIntegrationAccountCard
        data-qa={`settings-mobile-integration-account-${integration.id}`}
      >
        {cardContent}
      </S.MobileIntegrationAccountCard>
    );
  }

  return <S.IntegrationAccountRow>{cardContent}</S.IntegrationAccountRow>;
}
