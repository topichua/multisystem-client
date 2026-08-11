import styled, { css, keyframes } from "styled-components";

import { MESSAGE_SCROLL_HIGHLIGHT_CLASS } from "../../scroll-to-message-anchor";
import type { ConversationChannel } from "@/features/conversations/model/types";
import { BRAND_PRIMARY } from "@/styled/brand";

const TELEGRAM_OUTGOING_BUBBLE_COLOR = "#4a5df9";

const getOutgoingBubbleColor = (channel?: ConversationChannel): string =>
  channel === "instagram" ? BRAND_PRIMARY : TELEGRAM_OUTGOING_BUBBLE_COLOR;

const messageScrollHighlightBg = keyframes`
  0% {
    background-color: rgba(15, 23, 42, 0.13);
  }
  28% {
    background-color: rgba(15, 23, 42, 0.07);
  }
  100% {
    background-color: transparent;
  }
`;

export const MessageInlineActions = styled.div<{ $visible?: boolean }>`
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.14s ease-out;
`;

export const MessageBubbleRow = styled.div<{ $isOwn?: boolean }>`
  display: flex;
  flex-direction: ${({ $isOwn }) => ($isOwn ? "row" : "row-reverse")};
  align-items: center;
  gap: 4px;
  max-width: 100%;
`;

export const IconHitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.functional.text.heading};
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 1px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const MessageRow = styled.div<{ $isOwn?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  gap: 2px;
  box-sizing: border-box;
  padding: 3px 0;
  border-radius: 14px;

  &.${MESSAGE_SCROLL_HIGHLIGHT_CLASS} {
    animation: ${messageScrollHighlightBg} 2.2s ease-out forwards;
  }
`;

export const MessageWrap = styled.div<{ $isOwn?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  max-width: min(420px, 85%);
`;

export const ReplyQuote = styled.div<{
  $isOwn?: boolean;
  $interactive?: boolean;
}>`
  width: 100%;
  min-width: 0;
  margin-bottom: 8px;
  padding: 8px 12px 8px 10px;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  border-left: 3px solid transparent;

  ${({ theme, $isOwn }) =>
    $isOwn
      ? css`
          background: rgba(255, 255, 255, 0.14);
          border-left-color: rgba(255, 255, 255, 0.78);
        `
      : css`
          background: rgba(52, 168, 83, 0.11);
          border-left-color: ${theme.colors.semantic.success};
        `}

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;
      outline: none;

      &:focus-visible {
        box-shadow: 0 0 0 2px rgba(74, 93, 249, 0.45);
      }

      &:active {
        filter: brightness(0.97);
      }
    `}
`;

export const ReplyQuoteAuthor = styled.div<{ $isOwn?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 3px;

  ${({ theme, $isOwn }) =>
    $isOwn
      ? css`
          color: rgba(255, 255, 255, 0.94);
        `
      : css`
          color: ${theme.colors.semantic.success};
        `}
`;

export const ReplyQuoteText = styled.div<{ $isOwn?: boolean }>`
  font-size: 13px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${({ theme, $isOwn }) =>
    $isOwn
      ? css`
          color: rgba(255, 255, 255, 0.82);
        `
      : css`
          color: ${theme.colors.functional.text.subdued};
        `}
`;

export const MessageBubble = styled.div<{
  $isOwn?: boolean;
  $channel?: ConversationChannel;
  $muted?: boolean;
  $hasReaction?: boolean;
}>`
  position: relative;
  max-width: 100%;
  width: fit-content;
  padding: 6px 12px;
  border-radius: ${({ theme, $isOwn }) =>
    $isOwn
      ? `${theme.radius.extraLarge} ${theme.radius.extraLarge} 4px ${theme.radius.extraLarge}`
      : `${theme.radius.extraLarge} ${theme.radius.extraLarge} ${theme.radius.extraLarge} 4px`};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  background: ${({ theme }) => theme.colors.functional.background.natural};
  opacity: ${({ $muted }) => ($muted ? 0.75 : 1)};
  margin-bottom: ${({ $hasReaction }) => ($hasReaction ? "14px" : "0")};

  .conversation-message-body {
    white-space: pre-wrap;
  }

  ${({ theme, $isOwn, $channel }) =>
    $isOwn &&
    css`
      background: ${getOutgoingBubbleColor($channel)};
      border-color: ${getOutgoingBubbleColor($channel)};
      color: ${theme.colors.base.white};

      .conversation-message-body {
        color: ${theme.colors.base.white};
      }
    `}
`;

export const TextTimeRow = styled.div<{
  $hasAttachments?: boolean;
  $hasReply?: boolean;
}>`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${({ $hasAttachments, $hasReply }) =>
    $hasAttachments || $hasReply ? "6px" : "0"};
`;

export const TextTimeSpacer = styled.span`
  flex: 1;
  min-width: 0;
`;

export const Timestamp = styled.span<{ $isOwn?: boolean }>`
  flex-shrink: 0;
  align-self: flex-end;
  font-size: 11px;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  ${({ theme, $isOwn }) =>
    $isOwn
      ? css`
          color: rgba(255, 255, 255, 0.82);
        `
      : css`
          color: ${theme.colors.functional.text.subdued};
        `}
`;

export const ReactionBadge = styled.span<{ $isOwn?: boolean }>`
  position: absolute;
  bottom: -18px;
  ${({ $isOwn }) => ($isOwn ? "right: 12px" : "left: 12px")};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 26px;
  padding: 0 7px;
  font-size: 15px;
  line-height: 1;
  font-family:
    "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "EmojiSymbols",
    sans-serif;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
  user-select: none;
`;

export const ReadReceipt = styled.span<{ $offsetForReaction?: boolean }>`
  margin-top: ${({ $offsetForReaction }) =>
    $offsetForReaction ? "22px" : "5px"};
  font-size: 11px;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;
