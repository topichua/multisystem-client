import { ArrowLeftIcon, ArrowUUpLeftIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Form, Input, InputNumber } from "antd";
import { useState } from "react";

import type { OrderRefundCreatePayload } from "@/features/orders/model/order.types";

import type { TranslationFn } from "../../order-details-content.types";
import { isValidPaymentAmount } from "./is-valid-payment-amount";

type RefundPaymentFormProps = {
  paidAmount: number;
  currencyLabel: string;
  submitting: boolean;
  t: TranslationFn;
  onBack: () => void;
  onSubmit: (payload: OrderRefundCreatePayload) => Promise<void>;
};

export function RefundPaymentForm({
  paidAmount,
  currencyLabel,
  submitting,
  t,
  onBack,
  onSubmit,
}: RefundPaymentFormProps) {
  const [amount, setAmount] = useState<number | null>(
    paidAmount > 0 ? paidAmount : null,
  );
  const [note, setNote] = useState("");

  const canSubmit = isValidPaymentAmount(amount, paidAmount);
  const exceedsPaid =
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount > paidAmount;

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

      <Alert
        type="info"
        showIcon
        title={t("orders.details.refundPaymentHint")}
      />

      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label={t("orders.details.refundAmountLabel")}
          style={{ marginBottom: 12 }}
          validateStatus={exceedsPaid ? "error" : undefined}
          help={
            exceedsPaid
              ? t("orders.details.refundAmountExceedsPaid")
              : undefined
          }
        >
          <Flex gap={8} align="flex-start">
            <InputNumber
              min={0.01}
              max={paidAmount > 0 ? paidAmount : undefined}
              step={0.01}
              controls={false}
              value={amount}
              addonAfter={currencyLabel}
              placeholder="0"
              style={{ width: "100%", flex: 1 }}
              onChange={(value) =>
                setAmount(typeof value === "number" ? value : null)
              }
            />
            <Button
              icon={<ArrowUUpLeftIcon size={16} />}
              disabled={paidAmount <= 0}
              onClick={() => {
                if (paidAmount > 0) {
                  setAmount(paidAmount);
                }
              }}
            >
              {t("orders.details.fullPaidAmount")}
            </Button>
          </Flex>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Input.TextArea
            value={note}
            rows={3}
            placeholder={t("orders.details.refundNotePlaceholder")}
            onChange={(event) => setNote(event.target.value)}
          />
        </Form.Item>
      </Form>

      <Button
        type="primary"
        block
        icon={<ArrowUUpLeftIcon size={16} />}
        loading={submitting}
        disabled={!canSubmit || submitting}
        onClick={() => {
          if (!isValidPaymentAmount(amount, paidAmount)) {
            return;
          }

          const trimmedNote = note.trim();
          void onSubmit({
            amount,
            note: trimmedNote.length > 0 ? trimmedNote : null,
          });
        }}
      >
        {t("orders.details.submitRefund")}
      </Button>
    </Flex>
  );
}
