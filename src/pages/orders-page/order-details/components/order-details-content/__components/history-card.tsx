import type { TimelineProps } from "antd";
import { Card, Empty, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import {
  formatDate,
  getEventDescription,
} from "../../../utils/order-details.utils";

import type { OrderSectionProps } from "../order-details-content.types";
import { getActorLabel, getEventMeta } from "../utils/order-event.utils";

import * as S from "../order-details-content.styled";

const { Text } = Typography;

export const HistoryCard = observer(({ order, t }: OrderSectionProps) => {
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
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [order.events],
  );

  const historyItems = useMemo<TimelineProps["items"]>(
    () =>
      sortedEvents.map((event, index) => {
        const eventMeta = getEventMeta(event);
        const color = eventMeta.tone;
        const eventTitle = eventMeta.titleKey
          ? t(eventMeta.titleKey)
          : event.type;

        return {
          key: event.id,
          className: index === 0 ? "history-timeline-current-item" : undefined,
          color,
          styles: {
            icon: {
              backgroundColor: color,
              borderColor: color,
              width: 14,
              height: 14,
              marginLeft: -2,
            },
          },
          content: (
            <Flex vertical gap={2}>
              <Flex align="baseline" justify="space-between" gap={12}>
                <Flex align="center" gap={4}>
                  <Text strong style={{ color }}>
                    {eventTitle}
                  </Text>
                </Flex>
                <Text
                  type="secondary"
                  style={{ whiteSpace: "nowrap", fontSize: 11 }}
                >
                  {formatDate(event.createdAt)}
                </Text>
              </Flex>

              <Text>
                {getEventDescription(event, order.items, order.currency, t)}
              </Text>

              <Text type="secondary">
                {getActorLabel(event, actorNamesByUserId, t)}
              </Text>
            </Flex>
          ),
        };
      }),
    [actorNamesByUserId, order.currency, order.items, sortedEvents, t],
  );

  return (
    <Card
      className="no-print print-card"
      title={t("orders.details.statusHistory")}
    >
      {historyItems?.length ? (
        <S.Timeline variant="filled" items={historyItems} />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noHistory")}
        />
      )}
    </Card>
  );
});
