import { ArrowLeftIcon, LinkSimpleIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Form, Select, Spin, Typography } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";

import type { TranslationFn } from "../../order-details-content.types";
import { usePaymentIntegrations } from "./hooks/use-payment-integrations";
import { isValidPaymentAmount } from "./is-valid-payment-amount";
import { PaymentAmountField } from "./payment-amount-field";

const { Text } = Typography;

export type OnlinePaymentSubmitPayload = {
  amount: number;
  integrationId: number;
};

type OnlinePaymentFormProps = {
  remainingAmount: number | null;
  currencyLabel: string;
  submitting: boolean;
  t: TranslationFn;
  onBack: () => void;
  onSubmit: (payload: OnlinePaymentSubmitPayload) => Promise<void>;
};

export function OnlinePaymentForm({
  remainingAmount,
  currencyLabel,
  submitting,
  t,
  onBack,
  onSubmit,
}: OnlinePaymentFormProps) {
  const navigate = useNavigate();
  const { integrations, loading, error } = usePaymentIntegrations(true);
  const [integrationId, setIntegrationId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(
    remainingAmount && remainingAmount > 0 ? remainingAmount : null,
  );

  const selectedIntegrationId = useMemo(() => {
    if (integrations.length === 0) {
      return null;
    }

    if (
      integrationId != null &&
      integrations.some((item) => item.id === integrationId)
    ) {
      return integrationId;
    }

    const defaultIntegration =
      integrations.find((item) => item.isDefault) ?? integrations[0];

    return defaultIntegration?.id ?? null;
  }, [integrationId, integrations]);

  const canSubmit =
    selectedIntegrationId != null &&
    isValidPaymentAmount(amount, remainingAmount);

  return (
    <Flex vertical gap={12}>
      <Button
        type="text"
        size="small"
        icon={<ArrowLeftIcon size={14} />}
        onClick={onBack}
        style={{ alignSelf: "flex-start", paddingInline: 0 }}
      >
        {t("orders.details.paymentMethodBack")}
      </Button>

      {loading && (
        <Flex align="center" justify="center" style={{ minHeight: 120 }}>
          <Spin />
        </Flex>
      )}

      {!loading && error && <Alert type="error" showIcon title={error} />}

      {!loading && !error && integrations.length === 0 && (
        <Flex vertical align="center" gap={12} style={{ padding: "8px 0" }}>
          <Text type="secondary" style={{ textAlign: "center" }}>
            {t("orders.details.noPaymentIntegrations")}
          </Text>
          <Button
            type="primary"
            onClick={() => navigate(pagesMap.settingsIntegrations)}
          >
            {t("orders.details.openPaymentMethodsSettings")}
          </Button>
        </Flex>
      )}

      {!loading && !error && integrations.length > 0 && (
        <>
          <Form layout="vertical" requiredMark={false}>
            <Form.Item
              label={t("orders.details.onlinePaymentViaLabel")}
              style={{ marginBottom: 8 }}
            >
              <Select
                value={selectedIntegrationId ?? undefined}
                options={integrations.map((item) => ({
                  value: item.id,
                  label: item.displayName,
                }))}
                onChange={(value) => setIntegrationId(value)}
              />
            </Form.Item>

            <PaymentAmountField
              amount={amount}
              remainingAmount={remainingAmount}
              currencyLabel={currencyLabel}
              t={t}
              onAmountChange={setAmount}
            />
          </Form>

          <Button
            type="primary"
            block
            icon={<LinkSimpleIcon size={16} />}
            loading={submitting}
            disabled={!canSubmit || submitting}
            onClick={() => {
              if (
                !canSubmit ||
                selectedIntegrationId == null ||
                amount == null
              ) {
                return;
              }

              void onSubmit({
                amount,
                integrationId: selectedIntegrationId,
              });
            }}
          >
            {t("orders.details.createPaymentLink")}
          </Button>
        </>
      )}
    </Flex>
  );
}
