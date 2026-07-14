import { Card, Empty, Flex, Timeline, Typography } from "antd";
import type { TimelineProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { OrderDetails } from "@/features/orders/model/order.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

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
export const OrderHistoryTab = observer(({ order }: OrderHistoryTabProps) => {
  const { t } = useTranslation();
  const membersStore = useWorkspaceMembersStore();
  const actorNamesByUserId = useMemo(
    () =>
      new Map(
        membersStore.members.map((member) => [
          member.userId,
          getWorkspaceMemberName(member),
        ]),
      ),
    [membersStore.members],
  );

  const sortedEvents = useMemo(
    () =>
      [...order.events].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [order.events],
  );

  const historyItems = useMemo<TimelineProps['items']>(
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
              {t('orders.actor')}{' '}
              {event.userId != null
                ? (actorNamesByUserId.get(event.userId) ??
                  `#${event.actorId ?? event.userId}`)
                : `#${event.actorId}`}
            </Text>
          </Flex>
        ),
      })),
    [order.currency, order.items, sortedEvents, t, actorNamesByUserId],
  );

  return (
    <Card size="small">
      {historyItems?.length ? (
        <Timeline mode="left" items={historyItems} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('orders.noHistory')}
        />
      )}
    </Card>
  );
});
