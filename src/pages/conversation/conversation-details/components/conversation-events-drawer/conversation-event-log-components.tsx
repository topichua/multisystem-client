import type { ComponentType } from "react";
import type { TFunction } from "i18next";

import { getConversationGroupSystemNameKey } from "@/features/conversation-groups/model/system-groups";
import type { ConversationEvent } from "@/features/conversations/model/types";

import { ConversationEventInline } from "./conversation-event-inline";

type ConversationEventLogComponentProps = {
  event: ConversationEvent;
  t: TFunction;
  actorName?: string;
};

type KnownConversationEventType =
  | "conversation_created"
  | "group_changed"
  | "responsible_changed"
  | "order_created";

function payloadString(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function groupDisplayName(
  systemKey: string | undefined,
  t: TFunction,
): string | undefined {
  if (!systemKey) {
    return undefined;
  }

  const nameKey = getConversationGroupSystemNameKey(systemKey);
  return nameKey ? t(nameKey) : systemKey;
}

export const conversationEventLogComponents: {
  [
    key in KnownConversationEventType
  ]: ComponentType<ConversationEventLogComponentProps>;
} = {
  conversation_created: ({ event, t, actorName }) => (
    <ConversationEventInline createdAt={event.createdAt} actorName={actorName}>
      {t("conversation.events.log.conversationCreated")}
    </ConversationEventInline>
  ),

  group_changed: ({ event, t, actorName }) => {
    const from = groupDisplayName(
      payloadString(event.payload, "fromSystemKey"),
      t,
    );
    const to = groupDisplayName(payloadString(event.payload, "toSystemKey"), t);

    let message = t("conversation.events.log.groupChanged");
    if (from && to) {
      message = t("conversation.events.log.groupChangedWithTransition", {
        from,
        to,
      });
    } else if (to) {
      message = t("conversation.events.log.groupChangedTo", { to });
    }

    return (
      <ConversationEventInline
        createdAt={event.createdAt}
        actorName={actorName}
      >
        {message}
      </ConversationEventInline>
    );
  },

  responsible_changed: ({ event, t, actorName }) => {
    const name =
      payloadString(event.payload, "responsibleName") ??
      payloadString(event.payload, "newResponsibleName") ??
      payloadString(event.payload, "assigneeName");

    return (
      <ConversationEventInline
        createdAt={event.createdAt}
        actorName={actorName}
      >
        {name
          ? t("conversation.events.log.responsibleChangedWithName", { name })
          : t("conversation.events.log.responsibleChanged")}
      </ConversationEventInline>
    );
  },

  order_created: ({ event, t, actorName }) => {
    const orderId = event.payload.orderId;
    const orderNumber =
      typeof orderId === "number" && Number.isFinite(orderId)
        ? orderId
        : undefined;

    return (
      <ConversationEventInline
        createdAt={event.createdAt}
        actorName={actorName}
      >
        {orderNumber != null
          ? t("conversation.events.log.orderCreatedWithNumber", { orderNumber })
          : t("conversation.events.log.orderCreated")}
      </ConversationEventInline>
    );
  },
};
