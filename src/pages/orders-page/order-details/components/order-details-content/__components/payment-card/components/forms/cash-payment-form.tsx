import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Form } from "antd";
import { useState } from "react";

import type { TranslationFn } from "../../../../order-details-content.types";
import { isValidPaymentAmount } from "../../lib/is-valid-payment-amount";
import { PaymentAmountField } from "../payment-amount-field";

type CashPaymentFormProps = {
  remainingAmount: number | null;
  currencyLabel: string;
  submitting: boolean;
  t: TranslationFn;
  onBack: () => void;
  onSubmit: (amount: number) => Promise<void>;
};

export function CashPaymentForm({
  remainingAmount,
  currencyLabel,
  submitting,
  t,
  onBack,
  onSubmit,
}: CashPaymentFormProps) {
  const [amount, setAmount] = useState<number | null>(
    remainingAmount && remainingAmount > 0 ? remainingAmount : null,
  );

  const canSubmit = isValidPaymentAmount(amount, remainingAmount);

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

      <Alert type="info" showIcon title={t("orders.details.cashPaymentHint")} />

      <Form layout="vertical" requiredMark={false}>
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
        icon={<PlusIcon size={16} />}
        loading={submitting}
        disabled={!canSubmit || submitting}
        onClick={() => {
          if (!isValidPaymentAmount(amount, remainingAmount)) {
            return;
          }

          void onSubmit(amount);
        }}
      >
        {t("orders.details.addPayment")}
      </Button>
    </Flex>
  );
}
