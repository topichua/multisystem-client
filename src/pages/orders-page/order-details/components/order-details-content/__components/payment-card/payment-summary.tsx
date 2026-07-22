import { Flex, Typography } from "antd";

import { formatMoney } from "@/features/orders/utils/format-money";

import type { TranslationFn } from "../../order-details-content.types";
import * as S from "./payment-card.styled";

const { Text } = Typography;

type PaymentSummaryProps = {
  currency: string;
  dueAmount: number | null;
  paidAmount: number;
  remainingAmount: number | null;
  t: TranslationFn;
};

export function PaymentSummary({
  currency,
  dueAmount,
  paidAmount,
  remainingAmount,
  t,
}: PaymentSummaryProps) {
  return (
    <S.SummaryBox>
      <Flex vertical gap={8}>
        <Flex align="center" justify="space-between">
          <Text>{t("orders.details.amountToPay")}</Text>
          <Text>{formatMoney(dueAmount, currency)}</Text>
        </Flex>
        <Flex align="center" justify="space-between">
          <Text>{t("orders.details.amountPaid")}</Text>
          <Text type="success">{formatMoney(paidAmount, currency)}</Text>
        </Flex>
      </Flex>

      <S.SummaryDivider />

      <Flex align="center" justify="space-between">
        <Text strong>{t("orders.details.amountRemaining")}</Text>
        <Text strong>{formatMoney(remainingAmount, currency)}</Text>
      </Flex>
    </S.SummaryBox>
  );
}
