import { ArrowLeftIcon, CopySimpleIcon, PlusIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Select,
  Spin,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import type {
  ManualPaymentMethod,
  ManualPaymentMethodType,
} from "@/features/integrations/model/integration.types";

import { useNotification } from "@/shared/components/notification/use-notification";

import type { TranslationFn } from "../../order-details-content.types";
import { useManualPaymentMethods } from "./hooks/use-manual-payment-methods";
import { isValidPaymentAmount } from "./is-valid-payment-amount";
import { PaymentAmountField } from "./payment-amount-field";
import * as S from "./payment-card.styled";

const { Text } = Typography;

export type CardTransferPaymentSubmitPayload = {
  amount: number;
  manualPaymentMethodId: number;
  note: string;
};

type CardTransferPaymentFormProps = {
  orderId: number;
  remainingAmount: number | null;
  currencyLabel: string;
  submitting: boolean;
  t: TranslationFn;
  onBack: () => void;
  onSubmit: (payload: CardTransferPaymentSubmitPayload) => Promise<void>;
};

function normalizeMethodType(type: ManualPaymentMethodType): "iban" | "card" {
  return type === "card" ? "card" : "iban";
}

function buildCopyText(
  method: ManualPaymentMethod,
  amount: number | null,
  note: string,
  currencyLabel: string,
  purposeLabel: string,
): string {
  const lines = [method.name, method.displayValue || method.value];

  if (note.trim()) {
    lines.push(`${purposeLabel}: ${note.trim()}`);
  }

  if (typeof amount === "number" && Number.isFinite(amount)) {
    lines.push(`${amount} ${currencyLabel}`);
  }

  return lines.join("\n");
}

export function CardTransferPaymentForm({
  orderId,
  remainingAmount,
  currencyLabel,
  submitting,
  t,
  onBack,
  onSubmit,
}: CardTransferPaymentFormProps) {
  const navigate = useNavigate();
  const notification = useNotification();
  const { methods, loading, error } = useManualPaymentMethods(true);
  const [manualMethodId, setManualMethodId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(
    remainingAmount && remainingAmount > 0 ? remainingAmount : null,
  );
  const [note, setNote] = useState(() =>
    t("orders.details.paymentPurposeDefault", { orderId }),
  );

  const selectedMethodId = useMemo(() => {
    if (methods.length === 0) {
      return null;
    }

    if (
      manualMethodId != null &&
      methods.some((method) => method.id === manualMethodId)
    ) {
      return manualMethodId;
    }

    return methods[0]?.id ?? null;
  }, [manualMethodId, methods]);

  const selectedMethod = useMemo(
    () => methods.find((method) => method.id === selectedMethodId) ?? null,
    [methods, selectedMethodId],
  );

  const canSubmit =
    selectedMethod != null &&
    isValidPaymentAmount(amount, remainingAmount) &&
    note.trim().length > 0;

  const handleCopy = async () => {
    if (!selectedMethod) {
      return;
    }

    const copyText = buildCopyText(
      selectedMethod,
      amount,
      note,
      currencyLabel,
      t("orders.details.paymentPurposeLabel"),
    );

    try {
      await navigator.clipboard.writeText(copyText);
      notification.success({
        title: t("orders.details.paymentDetailsCopied"),
      });
    } catch {
      notification.error({
        title: t("orders.details.paymentDetailsCopyFailed"),
      });
    }
  };

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

      {!loading && !error && methods.length === 0 && (
        <Flex vertical align="center" gap={12} style={{ padding: "8px 0" }}>
          <Text type="secondary" style={{ textAlign: "center" }}>
            {t("orders.details.noManualPaymentMethods")}
          </Text>
          <Button
            type="primary"
            onClick={() => navigate(pagesMap.settingsIntegrations)}
          >
            {t("orders.details.openPaymentMethodsSettings")}
          </Button>
        </Flex>
      )}

      {!loading && !error && methods.length > 0 && selectedMethod && (
        <>
          {methods.length > 1 && (
            <Form layout="vertical" requiredMark={false}>
              <Form.Item
                label={t("orders.details.paymentMethodSelectLabel")}
                style={{ marginBottom: 0 }}
              >
                <Select
                  value={selectedMethodId ?? undefined}
                  options={methods.map((method) => ({
                    value: method.id,
                    label: `${method.name} · ${t(
                      `integrations.manualPayment.types.${normalizeMethodType(method.type)}`,
                    )}`,
                  }))}
                  onChange={(value) => setManualMethodId(value)}
                />
              </Form.Item>
            </Form>
          )}

          <S.TransferMethodBox>
            <Flex align="flex-start" justify="space-between" gap={12}>
              <Text type="secondary">
                {selectedMethod.name} ·{" "}
                {t(
                  `integrations.manualPayment.types.${normalizeMethodType(selectedMethod.type)}`,
                )}
              </Text>
              <Text strong style={{ textAlign: "right" }}>
                {selectedMethod.displayValue || selectedMethod.value}
              </Text>
            </Flex>
          </S.TransferMethodBox>

          <Form layout="vertical" requiredMark={false}>
            <Form.Item
              label={t("orders.details.paymentPurposeLabel")}
              style={{ marginBottom: 8 }}
            >
              <Input.TextArea
                value={note}
                autoSize={{ minRows: 2, maxRows: 4 }}
                onChange={(event) => setNote(event.target.value)}
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

          <Flex gap={8}>
            <Button
              block
              icon={<CopySimpleIcon size={16} />}
              disabled={!selectedMethod || submitting}
              onClick={() => {
                void handleCopy();
              }}
            >
              {t("orders.details.copyPaymentDetails")}
            </Button>
            <Button
              type="primary"
              block
              icon={<PlusIcon size={16} />}
              loading={submitting}
              disabled={!canSubmit || submitting}
              onClick={() => {
                if (!canSubmit || !selectedMethod || amount == null) {
                  return;
                }

                void onSubmit({
                  amount,
                  manualPaymentMethodId: selectedMethod.id,
                  note: note.trim(),
                });
              }}
            >
              {t("orders.details.addPayment")}
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
}
