import { Avatar, Flex, Space, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";

import {
  formatMoney,
  formatText,
  getVariantLabel,
} from "../utils/order-details.utils";

const { Text } = Typography;

type OrderItem = OrderDetails["items"][number];

type OrderProductsTableProps = {
  items: OrderItem[];
  currency: string;
};

export const OrderProductsTable = ({
  items,
  currency,
}: OrderProductsTableProps) => {
  const { t } = useTranslation();

  const columns = useMemo<TableProps<OrderItem>["columns"]>(
    () => [
      {
        title: t("orders.product"),
        key: "product",
        render: (_, item) => (
          <Space align="start">
            <Avatar shape="square" size={56} src={item.imageUrlSnapshot} />

            <Flex vertical>
              <Text strong>{formatText(item.productTitleSnapshot)}</Text>
              <Text type="secondary">{getVariantLabel(item)}</Text>

              {item.skuSnapshot && (
                <Text type="secondary">
                  {t("orders.sku")}: {item.skuSnapshot}
                </Text>
              )}
            </Flex>
          </Space>
        ),
      },
      {
        title: t("orders.quantity"),
        dataIndex: "quantity",
        align: "right",
        width: 96,
      },
      {
        title: t("orders.price"),
        key: "unitPriceAmount",
        align: "right",
        width: 140,
        render: (_, item) => formatMoney(item.unitPriceAmount, currency),
      },
      {
        title: t("orders.sum"),
        key: "totalPriceAmount",
        align: "right",
        width: 140,
        render: (_, item) => formatMoney(item.totalPriceAmount, currency),
      },
    ],
    [currency, t],
  );

  return (
    <Table
      rowKey="id"
      size="small"
      pagination={false}
      columns={columns}
      dataSource={items}
    />
  );
};
