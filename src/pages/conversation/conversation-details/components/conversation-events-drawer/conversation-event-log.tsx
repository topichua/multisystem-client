import { useTranslation } from "react-i18next";

import type { ConversationEvent } from "@/features/conversations/model/types";

import { ConversationEventInline } from "./conversation-event-inline";
import { conversationEventLogComponents } from "./conversation-event-log-components";

type ConversationEventLogProps = {
  event: ConversationEvent;
  actorName?: string;
};

function ConversationEventLogFallback({
  event,
  actorName,
}: ConversationEventLogProps) {
  const { t } = useTranslation();

  return (
    <ConversationEventInline createdAt={event.createdAt} actorName={actorName}>
      {t("conversation.events.log.fallback", { type: event.type })}
    </ConversationEventInline>
  );
}

export function ConversationEventLog({
  event,
  actorName,
}: ConversationEventLogProps) {
  const { t } = useTranslation();
  const EventLogComponent =
    conversationEventLogComponents[
      event.type as keyof typeof conversationEventLogComponents
    ];

  if (EventLogComponent !== undefined) {
    return <EventLogComponent event={event} t={t} actorName={actorName} />;
  }

  return <ConversationEventLogFallback event={event} actorName={actorName} />;
}
