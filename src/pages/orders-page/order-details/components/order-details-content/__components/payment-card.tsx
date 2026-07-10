import { CreditCardIcon } from "@phosphor-icons/react";
import { Flex } from "antd";

import { formatMoney } from "../../../utils/order-details.utils";
import { PaymentStatusTag } from "../../order-status-tags";

import type { OrderSectionProps } from "../order-details-content.types";
import { InfoList } from "./info-list";
import * as S from "../order-details-content.styled";

export const PaymentCard = ({ order, t }: OrderSectionProps) => (
  <S.DetailsCard className="no-print print-card section-payment">
    <S.CardHeader>
      <Flex align="center" gap={10}>
        <S.MutedIcon>
          <CreditCardIcon size={20} />
        </S.MutedIcon>
        <S.CardTitle level={3}>{t("orders.payment")}</S.CardTitle>
      </Flex>
    </S.CardHeader>

    <InfoList
      items={[
        {
          key: "method",
          label: t("orders.details.paymentMethod"),
          value: t("orders.details.paymentCashOnDelivery"),
        },
        {
          key: "status",
          label: t("orders.details.paymentStatusField"),
          value: <PaymentStatusTag value={order.paymentStatus} />,
        },
        {
          key: "amount",
          label: t("orders.details.amountToPay"),
          value: (
            <S.AmountDue>
              {formatMoney(order.totalAmount, order.currency)}
            </S.AmountDue>
          ),
        },
      ]}
    />
  </S.DetailsCard>
);
