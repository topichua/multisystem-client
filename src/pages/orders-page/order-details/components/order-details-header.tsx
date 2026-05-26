import { Button, Flex, Space, Statistic, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { OrderStatusSelect } from "@/features/orders/components/order-status-select";
import type { OrderDetails } from "@/features/orders/model/order.types";

import { formatDate, formatMoney } from "../utils/order-details.utils";

const { Text } = Typography;

type OrderDetailsHeaderProps = {
  order: OrderDetails | null;
  orderId: number | null;
  onBack: () => void;
  onStatusChangeSuccess: (nextStatusId: number) => void;
};

export const OrderDetailsHeader = ({
  order,
  orderId,
  onBack,
  onStatusChangeSuccess,
}: OrderDetailsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <PaneDetailLayout.Header data-qa="layout-order-details-header">
      <Flex vertical gap={16}>
        <Button
          type="link"
          onClick={onBack}
          style={{ padding: 0, alignSelf: "flex-start" }}
        >
          ← {t("orders.backToOrders")}
        </Button>

        <Flex align="flex-start" justify="space-between" gap={16} wrap>
          <Flex vertical gap={8}>
            <PaneSectionTitle>
              {t("orders.orderTitle")}{" "}
              {(order?.id ?? orderId) ? `#${order?.id ?? orderId}` : ""}
            </PaneSectionTitle>

            {order ? (
              <>
                <Text type="secondary">
                  {t("orders.createdAt")}: {formatDate(order.createdAt)}
                </Text>

                <Space wrap>
                  <OrderStatusSelect
                    orderId={order.id}
                    statusId={order.statusId}
                    onChangeSuccess={onStatusChangeSuccess}
                  />
                </Space>
              </>
            ) : null}
          </Flex>

          {order ? (
            <Statistic
              title={t("orders.orderAmount")}
              value={formatMoney(order.totalAmount, order.currency)}
            />
          ) : null}
        </Flex>
      </Flex>
    </PaneDetailLayout.Header>
  );
};
