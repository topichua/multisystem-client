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

const isLikelyImageUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }

  // Явный кейс под твой CDN
  if (trimmed.startsWith("https://imagedelivery.net/")) {
    return true;
  }

  // Более общий случай по расширению
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(trimmed);
};

export const MessageReplyQuote = ({
  message,
  isOwn,
  scrollable,
  onActivate,
}: MessageReplyQuoteProps) => {
  const body = (message.message ?? "").trim();
  const imageUrl = isLikelyImageUrl(body) ? body : null;

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
      <S.ReplyQuoteText $isOwn={isOwn}>
        {imageUrl ? (
          // маленький превьюшный вариант для прикреплённого изображения
          <img
            src={imageUrl}
            alt=""
            style={{ maxWidth: 96, maxHeight: 96, borderRadius: 4 }}
          />
        ) : (
          message.message
        )}
      </S.ReplyQuoteText>
    </S.ReplyQuote>
  );
};
