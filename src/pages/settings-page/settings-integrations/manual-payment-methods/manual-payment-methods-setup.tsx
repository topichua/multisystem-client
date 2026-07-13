import { Form } from "antd";
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
import { ManualPaymentMethodCard } from "./manual-payment-method-card";
import {
  ManualPaymentMethodForm,
  type ManualPaymentMethodFormValues,
} from "./manual-payment-method-form";

type ManualPaymentMethodsSetupProps = {
  integrations: IntegrationItem[];
  onCancel: () => void;
  onUpdated?: () => void;
};

export function ManualPaymentMethodsSetup({
  integrations,
  onCancel,
  onUpdated,
}: ManualPaymentMethodsSetupProps) {
  const { t } = useTranslation();
  const store = useIntegrationsStore();
  const notification = useNotification();
  const [form] = Form.useForm<ManualPaymentMethodFormValues>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (payload: ManualPaymentMethodPayload) => {
      setSaving(true);

      try {
        await store.createManualPaymentMethod(payload);
        form.resetFields();
        notification.success({
          title: t("integrations.manualPayment.createSuccess"),
        });
        onUpdated?.();
        onCancel();
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("integrations.manualPayment.createFailed"),
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [form, notification, onCancel, onUpdated, store, t],
  );

  return (
    <S.ManualPaymentMethodsSetup>
      <ManualPaymentMethodForm
        form={form}
        mode="create"
        submitting={saving}
        onCancel={onCancel}
        onSubmit={(payload) => void handleSubmit(payload)}
      />

      {integrations.length > 0 ? (
        <S.ManualPaymentMethodsList>
          {integrations.map((integration) => (
            <ManualPaymentMethodCard
              key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
              integration={integration}
              onUpdated={onUpdated}
            />
          ))}
        </S.ManualPaymentMethodsList>
      ) : null}
    </S.ManualPaymentMethodsSetup>
  );
}
