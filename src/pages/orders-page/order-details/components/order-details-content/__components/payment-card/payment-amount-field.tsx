import { WalletIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, InputNumber } from "antd";

import type { TranslationFn } from "../../order-details-content.types";

type PaymentAmountFieldProps = {
  amount: number | null;
  remainingAmount: number | null;
  currencyLabel: string;
  t: TranslationFn;
  onAmountChange: (amount: number | null) => void;
};

export function PaymentAmountField({
  amount,
  remainingAmount,
  currencyLabel,
  t,
  onAmountChange,
}: PaymentAmountFieldProps) {
  const exceedsRemaining =
    typeof amount === "number" &&
    typeof remainingAmount === "number" &&
    Number.isFinite(amount) &&
    Number.isFinite(remainingAmount) &&
    amount > remainingAmount;

  return (
    <Form.Item
      label={t("orders.details.amountLabel")}
      style={{ marginBottom: 0 }}
      validateStatus={exceedsRemaining ? "error" : undefined}
      help={
        exceedsRemaining
          ? t("orders.details.amountExceedsRemaining")
          : undefined
      }
    >
      <Flex gap={8} align="flex-start">
        <InputNumber
          min={0.01}
          max={
            remainingAmount != null && remainingAmount > 0
              ? remainingAmount
              : undefined
          }
          step={0.01}
          controls={false}
          value={amount}
          addonAfter={currencyLabel}
          placeholder="0"
          style={{ width: "100%", flex: 1 }}
          onChange={(value) =>
            onAmountChange(typeof value === "number" ? value : null)
          }
        />
        <Button
          icon={<WalletIcon size={16} />}
          disabled={remainingAmount == null || remainingAmount <= 0}
          onClick={() => {
            if (remainingAmount != null && remainingAmount > 0) {
              onAmountChange(remainingAmount);
            }
          }}
        >
          {t("orders.details.fullOrderAmount")}
        </Button>
      </Flex>
    </Form.Item>
  );
}
