import { Card, Col, Descriptions, Row, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";
import { formatMoney } from "../../utils/order-details.utils";
import { OrderProductsTable } from "../order-products-table";

const { Text } = Typography;

type OrderProductsTabProps = {
  order: OrderDetails;
};

/**
 * @deprecated Kept temporarily for the legacy tabbed order details layout.
 * Use OrderDetailsContent for the current order details design.
 */
export function OrderProductsTab({ order }: OrderProductsTabProps) {
  const { t } = useTranslation();

  const totalsInfoItems: DescriptionsProps["items"] = [
    {
      key: "subtotalAmount",
      label: t("orders.subtotal"),
      children: formatMoney(order.subtotalAmount, order.currency),
    },
    {
      key: "discountAmount",
      label: t("orders.discount"),
      children: formatMoney(order.discountAmount, order.currency),
    },
    {
      key: "deliveryAmount",
      label: t("orders.deliveryAmount"),
      children: formatMoney(order.deliveryAmount, order.currency),
    },
    {
      key: "totalAmount",
      label: <Text strong>{t("orders.total")}</Text>,
      children: (
        <Text strong>{formatMoney(order.totalAmount, order.currency)}</Text>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginInline: 0 }}>
      <Col xs={24} xl={16}>
        <Card size="small">
          <OrderProductsTable items={order.items} currency={order.currency} />
        </Card>
      </Col>

      <Col xs={24} xl={8}>
        <Card size="small" title={t("orders.total")}>
          <Descriptions size="small" column={1} items={totalsInfoItems} />
        </Card>
      </Col>
    </Row>
  );
}
