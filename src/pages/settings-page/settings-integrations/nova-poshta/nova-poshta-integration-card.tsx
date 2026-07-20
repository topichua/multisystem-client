import { ClockIcon, PencilSimpleIcon, PlugsIcon } from "@phosphor-icons/react";
import {
  Alert,
  Avatar,
  Button,
  Flex,
  Form,
  Space,
  Spin,
  Typography,
} from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { integrationsApi } from "@/features/integrations/api/integrations-api";
import { useNotification } from "@/shared/components/notification/use-notification";
import { formatDateTime } from "@/utils/date-time";

import * as S from "../settings-integrations.styled";
import {
  buildInitialValues,
  buildUpdatePayload,
} from "./nova-poshta-integration-card/nova-poshta-integration-card.helpers";
import type {
  NovaPoshtaIntegrationCardProps,
  NovaPoshtaIntegrationEditFormValues,
} from "./nova-poshta-integration-card/nova-poshta-integration-card.types";
import { NovaPoshtaIntegrationDetailsView } from "./nova-poshta-integration-card/nova-poshta-integration-details-view";
import { NovaPoshtaIntegrationEditForm } from "./nova-poshta-integration-card/nova-poshta-integration-edit-form";
import { useNovaPoshtaEditSenders } from "./nova-poshta-integration-card/use-nova-poshta-edit-senders";
import { useNovaPoshtaIntegrationDetails } from "./nova-poshta-integration-card/use-nova-poshta-integration-details";
import { useNovaPoshtaLocationSelects } from "./nova-poshta-integration-card/use-nova-poshta-location-selects";

const { Text } = Typography;

export function NovaPoshtaIntegrationCard({
  integration,
  isDisconnecting,
  layout = "desktop",
  onDisconnect,
  onUpdated,
}: NovaPoshtaIntegrationCardProps) {
  const { t } = useTranslation();
  const notification = useNotification();
  const [form] = Form.useForm<NovaPoshtaIntegrationEditFormValues>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isMobile = layout === "mobile";
  const {
    details,
    error: loadError,
    isLoading,
    reload,
    setDetails,
  } = useNovaPoshtaIntegrationDetails({
    integrationId: String(integration.id),
  });
  const locationSelects = useNovaPoshtaLocationSelects({
    details,
    form,
    isEditing: editing,
  });
  const senderSelect = useNovaPoshtaEditSenders({
    details,
    form,
    isEditing: editing,
  });

  const openEdit = useCallback(() => {
    if (!details) {
      return;
    }

    form.setFieldsValue(buildInitialValues(details));
    setEditing(true);
  }, [details, form]);

  const cancelEdit = useCallback(() => {
    if (details) {
      form.setFieldsValue(buildInitialValues(details));
    }

    setEditing(false);
    locationSelects.clearSelects();
    senderSelect.clear();
  }, [details, form, locationSelects, senderSelect]);

  const handleSubmit = useCallback(
    async (values: NovaPoshtaIntegrationEditFormValues) => {
      if (!details) {
        return;
      }

      setSaving(true);

      try {
        const updated = await integrationsApi.updateNovaPoshtaIntegration(
          details.id,
          buildUpdatePayload(values, details),
        );

        setDetails(updated);
        setEditing(false);
        notification.success({
          title: t("integrations.novaPoshtaDetails.updateSuccess"),
        });
        onUpdated?.();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("integrations.novaPoshtaDetails.updateFailed"),
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [details, notification, onUpdated, setDetails, t],
  );

  const statusRow = (
    <S.MobileIntegrationAccountStatusRow>
      <S.IntegrationConnectedStatus>
        {t("integrations.connectedTag")}
      </S.IntegrationConnectedStatus>
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

  const cardBody =
    editing && details ? (
      <NovaPoshtaIntegrationEditForm
        form={form}
        isSaving={saving}
        locationSelects={locationSelects}
        senderSelect={senderSelect}
        onCancel={cancelEdit}
        onSubmit={(values) => void handleSubmit(values)}
      />
    ) : details ? (
      <NovaPoshtaIntegrationDetailsView details={details} />
    ) : null;

  const cardContent = (
    <Flex vertical gap={16} flex={1}>
      <Flex align="flex-start" justify="space-between" gap={16} wrap>
        <Flex align="flex-start" gap={12} flex={1}>
          <Avatar size={40} src={integration.avatar} alt={integration.name}>
            {integration.name.charAt(0).toUpperCase()}
          </Avatar>
          <Flex vertical gap={8} flex={1}>
            <Text strong>{details?.name ?? integration.name}</Text>
            {statusRow}
          </Flex>
        </Flex>

        <Space wrap>
          <Button
            type="text"
            icon={<PencilSimpleIcon />}
            disabled={!details || isLoading || editing}
            aria-label={t("integrations.novaPoshtaDetails.editAction")}
            onClick={openEdit}
          />
          <Button
            danger
            loading={isDisconnecting}
            icon={<PlugsIcon />}
            data-qa={
              isMobile
                ? `settings-mobile-integration-disconnect-${integration.id}`
                : undefined
            }
            onClick={() => onDisconnect(integration)}
          >
            {t("integrations.disconnectAction")}
          </Button>
        </Space>
      </Flex>

      {isLoading ? (
        <Flex justify="center">
          <Spin size="small" />
        </Flex>
      ) : loadError ? (
        <Alert
          showIcon
          type="error"
          title={loadError}
          action={
            <Button size="small" onClick={reload}>
              {t("integrations.novaPoshtaDetails.retryAction")}
            </Button>
          }
        />
      ) : (
        cardBody
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
