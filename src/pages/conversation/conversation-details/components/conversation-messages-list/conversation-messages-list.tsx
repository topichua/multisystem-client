import { Flex, Spin } from "antd";
import { Fragment, memo } from "react";

import type {
  ConversationChannel,
  ConversationMessage,
} from "@/features/conversations/model/types";
import type { ConversationOwnershipContext } from "@/features/conversations/utils/conversation-message-ownership";

import * as S from "../../conversation-details.styled";
import type { ReplyComposeTarget } from "../../reply-compose-target";
import { MessageItem } from "../message-item/message-item";
import {
  formatConversationDayLabel,
  isSameConversationDay,
} from "@/utils/date-time";

type ConversationMessagesListProps = {
  chronologicalMessages: ConversationMessage[];
  channel?: ConversationChannel;
  selfIds: ConversationOwnershipContext["selfIds"];
  participantId?: string | number | null;
  loadingOlderMessages: boolean;
  lastOwnMessageIndex: number;
  onResend: (clientTempId: string) => void;
  onScrollToMessage: (messageId: string) => void;
  onStartReply: (target: ReplyComposeTarget) => void;
};

export const ConversationMessagesList = memo(function ConversationMessagesList({
  chronologicalMessages,
  channel,
  selfIds,
  participantId,
  loadingOlderMessages,
  lastOwnMessageIndex,
  onResend,
  onScrollToMessage,
  onStartReply,
}: ConversationMessagesListProps) {
  return (
    <S.MessagesInner>
      {loadingOlderMessages && (
        <Flex justify="center" style={{ padding: "10px 0 4px" }}>
          <Spin size="small" />
        </Flex>
      )}
      {chronologicalMessages.map((message, index) => {
        const prevMessage =
          index > 0 ? chronologicalMessages[index - 1] : undefined;
        const showDaySeparator =
          prevMessage == null ||
          !isSameConversationDay(
            message.created_time,
            prevMessage.created_time,
          );
        const dayLabel = formatConversationDayLabel(message.created_time);

        return (
          <Fragment
            key={message.clientTempId ?? message.id ?? `message-${index}`}
          >
            {showDaySeparator && dayLabel !== "" && (
              <S.DaySeparator role="separator" aria-label={dayLabel}>
                <span>{dayLabel}</span>
              </S.DaySeparator>
            )}
            <MessageItem
              message={message}
              channel={channel}
              index={index}
              selfIds={selfIds}
              participantId={participantId}
              chronologicalMessages={chronologicalMessages}
              showReadReceipt={
                index === lastOwnMessageIndex &&
                message.read_at != null &&
                message.read_at !== ""
              }
              onResend={onResend}
              onScrollToMessage={onScrollToMessage}
              onStartReply={onStartReply}
            />
          </Fragment>
        );
      })}
    </S.MessagesInner>
  );
});

ConversationMessagesList.displayName = "ConversationMessagesList";
