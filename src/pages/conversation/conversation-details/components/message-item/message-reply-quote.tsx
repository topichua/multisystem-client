import type { KeyboardEvent } from "react";

import type { ConversationMessage } from "@/features/conversations/model/types";
import * as S from "./message-item.styled";
import { replyQuoteAuthorLabel } from "./reply-quote-author-label";

type MessageReplyQuoteProps = {
  message: NonNullable<ConversationMessage["replied_to_message"]>;
  isOwn: boolean;
  scrollable: boolean;
  onActivate: () => void;
};

export const MessageReplyQuote = ({
  message,
  isOwn,
  scrollable,
  onActivate,
}: MessageReplyQuoteProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <S.ReplyQuote
      $isOwn={isOwn}
      $interactive={scrollable}
      role={scrollable ? "button" : undefined}
      tabIndex={scrollable ? 0 : undefined}
      onClick={scrollable ? onActivate : undefined}
      onKeyDown={scrollable ? handleKeyDown : undefined}
    >
      <S.ReplyQuoteAuthor $isOwn={isOwn}>
        {replyQuoteAuthorLabel(message.from)}
      </S.ReplyQuoteAuthor>
      <S.ReplyQuoteText $isOwn={isOwn}>{message.message}</S.ReplyQuoteText>
    </S.ReplyQuote>
  );
};
