import { Flex, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";

import { OrderCustomerTab } from "../order-customer-tab";
import { OrderHistoryTab } from "./order-history-tab";
import { OrderOverviewTab } from "./order-overview-tab";
import { OrderProductsTab } from "./order-products-tab";

type OrderDetailsTabsProps = {
  order: OrderDetails;
};

/**
 * @deprecated Kept temporarily for the legacy tabbed order details layout.
 * Use OrderDetailsContent for the current order details design.
 */
export const OrderDetailsTabs = ({ order }: OrderDetailsTabsProps) => {
  const { t } = useTranslation();

  const tabs: TabsProps["items"] = [
    {
      key: "overview",
      label: t("orders.overview"),
      children: <OrderOverviewTab order={order} />,
    },
    {
      key: "products",
      label: t("orders.productsTab"),
      children: <OrderProductsTab order={order} />,
    },
    {
      key: "customer",
      label: t("orders.customerTab"),
      children: <OrderCustomerTab order={order} />,
    },
    {
      key: "history",
      label: t("orders.historyTab"),
      children: <OrderHistoryTab order={order} />,
    },
  ];

  return (
    <Flex vertical gap={16} style={{ paddingTop: 8 }}>
      <Tabs items={tabs} />
    </Flex>
  );
};
