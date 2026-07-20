import { CreditCardIcon } from "@phosphor-icons/react";
import { Card, Flex, Typography } from "antd";

import { formatMoney } from "../../../utils/order-details.utils";
import { PaymentStatusTag } from "../../order-status-tags";

import type { OrderSectionProps } from "../order-details-content.types";
import { InfoList } from "./info-list";

const { Text } = Typography;

export const PaymentCard = ({ order, t }: OrderSectionProps) => (
  <Card
    className="no-print print-card"
    title={
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={10}>
          <CreditCardIcon size={20} />
          <span>{t("orders.payment")}</span>
        </Flex>
      </Flex>
    }
  >
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
          value: <PaymentStatusTag value={order.payment.status} />,
        },
        {
          key: "amount",
          label: t("orders.details.amountToPay"),
          value: (
            <Text strong style={{ fontSize: 16 }}>
              {formatMoney(order.totalAmount, order.currency)}
            </Text>
          ),
        },
      ]}
    />
  </Card>
);
