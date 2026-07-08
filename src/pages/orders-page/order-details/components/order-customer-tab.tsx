import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Divider,
  Flex,
  Row,
  Typography,
} from "antd";
import type { DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";

import {
  EMPTY_VALUE,
  formatDate,
  formatText,
  getCustomerInitials,
  getCustomerName,
  getOrderSourceLabel,
} from "../utils/order-details.utils";

const { Text } = Typography;

type OrderCustomerTabProps = {
  order: OrderDetails;
};

/**
 * @deprecated Kept temporarily for the legacy tabbed order details layout.
 * Use OrderDetailsContent for the current order details design.
 */
export function OrderCustomerTab({ order }: OrderCustomerTabProps) {
  const { t } = useTranslation();

  const customerInfoItems: DescriptionsProps["items"] = [
    {
      key: "customerId",
      label: t("orders.customerId"),
      children: order.customer.id,
    },
    {
      key: "phone",
      label: t("orders.phone"),
      children: order.customer.phone ? (
        <Typography.Link href={`tel:${order.customer.phone}`}>
          {order.customer.phone}
        </Typography.Link>
      ) : (
        EMPTY_VALUE
      ),
    },
    {
      key: "createdAt",
      label: t("orders.customerCreatedAt"),
      children: formatDate(order.customer.createdAt),
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
      <Col xs={24} xl={12}>
        <Card size="small" title={t("orders.customer")}>
          <Flex align="center" gap={12}>
            <Avatar size={48}>{getCustomerInitials(order.customer)}</Avatar>

            <Flex vertical>
              <Text strong>{getCustomerName(order.customer)}</Text>
              <Text type="secondary">
                {getOrderSourceLabel(t, order.source)}
              </Text>
            </Flex>
          </Flex>

          <Divider />

          <Descriptions size="small" column={1} items={customerInfoItems} />
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card size="small" title={t("orders.conversation")}>
          <Descriptions
            size="small"
            column={1}
            items={[
              {
                key: "conversationId",
                label: t("orders.conversationId"),
                children: formatText(order.conversation?.id),
              },
              {
                key: "source",
                label: t("orders.source"),
                children: getOrderSourceLabel(t, order.source),
              },
              {
                key: "groupId",
                label: t("orders.groupId"),
                children: formatText(order.conversation?.groupId),
              },
              {
                key: "responsibleMemberId",
                label: t("orders.responsibleMemberId"),
                children: formatText(order.conversation?.responsibleMemberId),
              },
              {
                key: "readAt",
                label: t("orders.readAt"),
                children: formatDate(order.conversation?.readAt),
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}
