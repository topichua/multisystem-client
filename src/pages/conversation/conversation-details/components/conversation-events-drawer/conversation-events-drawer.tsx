import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { Alert, Drawer, Flex, Spin, Timeline, Typography } from "antd";
import type { TimelineProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { ConversationEvent } from "@/features/conversations/model/types";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ConversationEventDot } from "./conversation-event-dot";
import { ConversationEventLog } from "./conversation-event-log";
import { useConversationEvents } from "./use-conversation-events";

type ConversationEventsDrawerProps = {
  open: boolean;
  conversationId: string | undefined;
  onClose: () => void;
};

const { Text, Title } = Typography;

function resolveActorName(
  event: ConversationEvent,
  actorNamesByUserId: Map<number, string>,
  systemActorLabel: string,
): string {
  const payloadActor =
    typeof event.payload.actorName === "string"
      ? event.payload.actorName.trim()
      : typeof event.payload.createdByName === "string"
        ? event.payload.createdByName.trim()
        : "";

  if (payloadActor) {
    return payloadActor;
  }

  if (event.actorId != null) {
    return actorNamesByUserId.get(event.actorId) ?? systemActorLabel;
  }

  return systemActorLabel;
}

export const ConversationEventsDrawer = observer(
  function ConversationEventsDrawer({
    open,
    conversationId,
    onClose,
  }: ConversationEventsDrawerProps) {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const membersStore = useWorkspaceMembersStore();
    const { events, loading, error } = useConversationEvents(
      conversationId,
      open,
    );

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

    const systemActorLabel = t("conversation.events.systemActor");

    const timelineItems = useMemo<TimelineProps["items"]>(
      () =>
        events.map((event) => ({
          key: event.id,
          dot: <ConversationEventDot type={event.type} />,
          content: (
            <ConversationEventLog
              event={event}
              actorName={resolveActorName(
                event,
                actorNamesByUserId,
                systemActorLabel,
              )}
            />
          ),
        })),
      [actorNamesByUserId, events, systemActorLabel],
    );

    return (
      <Drawer
        title={
          <Flex align="center" gap={8} style={{ minWidth: 0 }}>
            <ClockCounterClockwiseIcon size={18} />
            <Title level={5} style={{ margin: 0 }}>
              {t("conversation.events.title")}
            </Title>
          </Flex>
        }
        closable={{
          "aria-label": t("conversation.events.closeAria"),
          placement: "end",
        }}
        placement="right"
        open={open}
        onClose={onClose}
        size={isMobileViewport ? "100vw" : 400}
        destroyOnHidden
        data-qa="layout-conversation-details-events-drawer"
        styles={{
          header: {
            padding: "18px 22px 16px",
          },
          body: {
            padding: "16px 22px",
          },
        }}
      >
        <Spin spinning={loading}>
          <Flex vertical gap={16}>
            {error && <Alert title={error} type="error" />}
            <Text type="secondary">{t("conversation.events.description")}</Text>

            <Flex style={{ paddingLeft: 12 }}>
              {timelineItems && timelineItems.length > 0 && (
                <Timeline
                  items={timelineItems}
                  style={{ marginBlockStart: 4 }}
                  styles={{ item: { paddingBottom: 24 } }}
                />
              )}
            </Flex>
          </Flex>
        </Spin>
      </Drawer>
    );
  },
);
