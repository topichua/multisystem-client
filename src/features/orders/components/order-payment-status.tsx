import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { OrderPaymentStatus } from "@/features/orders/model/order.types";
import { base } from "@/styled/definitions/colors";

const PAYMENT_STATUS_DOT_COLOR: Record<OrderPaymentStatus, string> = {
  unpaid: base.red[5],
  paid: base.green[5],
  partial: base.orange[4],
};

const Root = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  line-height: 1.25;
  color: ${({ $color }) => $color};
`;

const Dot = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 4px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

type OrderPaymentStatusLabelProps = {
  status: OrderPaymentStatus;
};

export const OrderPaymentStatusLabel = ({
  status,
}: OrderPaymentStatusLabelProps) => {
  const { t } = useTranslation();
  const color = PAYMENT_STATUS_DOT_COLOR[status];

  return (
    <Root $color={color}>
      <Dot $color={color} aria-hidden />
      {t(`orders.paymentStatus.${status}`)}
    </Root>
  );
};
