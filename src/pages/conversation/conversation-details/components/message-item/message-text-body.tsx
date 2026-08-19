import { Typography } from "antd";
import { memo, useMemo } from "react";

import { MessageAttachments } from "../message-attachments/message-attachments";
import {
  getAttachmentImageUrl,
  isAttachmentPlaceholderMessage,
} from "../message-attachments/message-attachment-utils";
import type { MessageBodyProps } from "./message-body.types";
import * as S from "./message-item.styled";

const { Paragraph } = Typography;

export const MessageTextBody = memo(
  ({
    message,
    index,
    clientTempId,
    isOwn,
    timeLabel,
    hasReplyQuote,
  }: MessageBodyProps) => {
    const messageText = message.message ?? "";
    const hasAttachments = (message.attachments?.data?.length ?? 0) > 0;
    const displayMessageText = useMemo(() => {
      const trimmed = messageText.trim();
      if (!trimmed || !hasAttachments) {
        return messageText;
      }

      if (
        isAttachmentPlaceholderMessage(trimmed, message.attachments?.data ?? [])
      ) {
        return "";
      }

      const imageUrls = new Set(
        (message.attachments?.data ?? [])
          .map(getAttachmentImageUrl)
          .filter((url): url is string => url != null),
      );

      return imageUrls.has(trimmed) ? "" : messageText;
    }, [hasAttachments, message.attachments?.data, messageText]);

    const showTextTimeRow =
      timeLabel !== "" ||
      displayMessageText.trim().length > 0 ||
      hasAttachments ||
      hasReplyQuote;

    return (
      <>
        <MessageAttachments
          messageId={message.id ?? clientTempId ?? `message-${index}`}
          attachments={message.attachments ?? { data: [] }}
        />

        {showTextTimeRow && (
          <S.TextTimeRow
            $hasAttachments={hasAttachments}
            $hasReply={hasReplyQuote}
          >
            {displayMessageText ? (
              <Paragraph
                className="conversation-message-body"
                style={{ flex: 1, marginBottom: 0, minWidth: 0 }}
              >
                {displayMessageText}
              </Paragraph>
            ) : (
              <S.TextTimeSpacer aria-hidden />
            )}
            {timeLabel !== "" && (
              <S.Timestamp $isOwn={isOwn}>{timeLabel}</S.Timestamp>
            )}
          </S.TextTimeRow>
        )}
      </>
    );
  },
);

MessageTextBody.displayName = "MessageTextBody";
