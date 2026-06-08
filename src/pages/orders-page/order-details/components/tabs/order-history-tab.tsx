import { Card, Empty, Flex, Timeline, Typography } from "antd";
import type { TimelineProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";

import {
  formatDate,
  getEventDescription,
} from "../../utils/order-details.utils";

const { Text } = Typography;

type OrderHistoryTabProps = {
  order: OrderDetails;
};

/**
 * @deprecated Kept temporarily for the legacy tabbed order details layout.
 * Use OrderDetailsContent for the current order details design.
 */
export function OrderHistoryTab({ order }: OrderHistoryTabProps) {
  const { t } = useTranslation();

  const sortedEvents = useMemo(
    () =>
      [...order.events].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [order.events],
  );

  const historyItems = useMemo<TimelineProps["items"]>(
    () =>
      sortedEvents.map((event) => ({
        key: event.id,
        label: formatDate(event.createdAt),
        children: (
          <Flex vertical gap={2}>
            <Text>
              {getEventDescription(event, order.items, order.currency, t)}
            </Text>

            <Text type="secondary">
              {t("orders.actor")} #{event.actorId}
            </Text>
          </Flex>
        ),
      })),
    [order.currency, order.items, sortedEvents, t],
  );

  return (
    <Card size="small">
      {historyItems?.length ? (
        <Timeline mode="left" items={historyItems} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noHistory")}
        />
      )}
    </Card>
  );
}
