import type { TableProps } from "antd";
import { Card, Empty, Flex, Table, Tag, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";

import type { OrderDetailsEvent } from "@/features/orders/model/order.types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import {
  formatDate,
  getEventDescription,
} from "../../../utils/order-details.utils";

import type {
  EventTone,
  OrderSectionProps,
} from "../order-details-content.types";
import { getActorLabel, getEventMeta } from "../utils/order-event.utils";
import { CollapsibleListToggle } from "./collapsible-list-toggle";

const { Text } = Typography;

const VISIBLE_EVENTS_LIMIT = 5;

const EVENT_TONE_TAG_COLOR: Record<EventTone, string> = {
  blue: "blue",
  green: "green",
  orange: "orange",
  purple: "purple",
  gray: "default",
};

export const HistoryCard = observer(({ order, t }: OrderSectionProps) => {
  const membersStore = useWorkspaceMembersStore();
  const [expanded, setExpanded] = useState(false);

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

  const visibleEvents = useMemo(() => {
    if (expanded || sortedEvents.length <= VISIBLE_EVENTS_LIMIT) {
      return sortedEvents;
    }

    return sortedEvents.slice(0, VISIBLE_EVENTS_LIMIT);
  }, [expanded, sortedEvents]);

  const columns = useMemo<TableProps<OrderDetailsEvent>["columns"]>(
    () => [
      {
        title: t("orders.details.historyDate"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value: string) => (
          <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
            {formatDate(value)}
          </Text>
        ),
      },
      {
        title: t("orders.details.historyEvent"),
        key: "event",
        width: 200,
        render: (_, event) => {
          const eventMeta = getEventMeta(event);
          const eventTitle = eventMeta.titleKey
            ? t(eventMeta.titleKey)
            : event.type;

          return (
            <Tag
              color={EVENT_TONE_TAG_COLOR[eventMeta.tone]}
              style={{ marginInlineEnd: 0 }}
            >
              {eventTitle}
            </Tag>
          );
        },
      },
      {
        title: t("orders.details.historyDetails"),
        key: "details",
        render: (_, event) =>
          getEventDescription(event, order.items, order.currency, t),
      },
      {
        title: t("orders.actor"),
        key: "actor",
        width: 160,
        ellipsis: true,
        render: (_, event) => (
          <Text type="secondary">
            {getActorLabel(event, actorNamesByUserId, t)}
          </Text>
        ),
      },
    ],
    [actorNamesByUserId, order.currency, order.items, t],
  );

  return (
    <Card
      className="no-print print-card"
      title={t("orders.details.statusHistory")}
    >
      {sortedEvents.length ? (
        <Flex vertical gap={8}>
          <Table<OrderDetailsEvent>
            rowKey="id"
            size="small"
            pagination={false}
            columns={columns}
            dataSource={visibleEvents}
            scroll={{ x: 640 }}
          />
          {sortedEvents.length > VISIBLE_EVENTS_LIMIT && (
            <CollapsibleListToggle
              expanded={expanded}
              t={t}
              onToggle={() => setExpanded((current) => !current)}
            />
          )}
        </Flex>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noHistory")}
        />
      )}
    </Card>
  );
});
