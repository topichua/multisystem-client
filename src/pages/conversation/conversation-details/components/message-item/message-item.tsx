import { CopySimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Typography } from "antd";
import type { MenuProps } from "antd";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type {
  ConversationChannel,
  ConversationMessage,
} from "@/features/conversations/model/types";
import type { ConversationOwnershipContext } from "@/features/conversations/utils/conversation-message-ownership";
import { isOwnConversationMessage } from "@/features/conversations/utils/conversation-message-ownership";
import type { ReplyComposeTarget } from "../../reply-compose-target";
import { MessageAttachments } from "../message-attachments/message-attachments";
import {
  copyTextToClipboard,
  getMessageClipboardText,
} from "./copy-message-to-clipboard";
import { MessageFailureActions } from "./message-failure-actions";
import { MessageInlineActions } from "./message-inline-actions";
import * as S from "./message-item.styled";
import { MessageReplyQuote } from "./message-reply-quote";
import { normalizeWebhookReactionEmoji } from "./normalize-webhook-reaction-emoji";
import { replyQuoteAuthorLabel } from "./reply-quote-author-label";
import { formatMessageTime } from "@/utils/date-time";
import { useNotification } from "@/shared/components/notification/use-notification";

const { Paragraph } = Typography;

type MessageItemProps = {
  message: ConversationMessage;
  channel?: ConversationChannel;
  index: number;
  selfIds: ConversationOwnershipContext["selfIds"];
  participantId?: string | number | null;
  chronologicalMessages: ConversationMessage[];
  showReadReceipt?: boolean;
  onResend: (clientTempId: string) => void;
  onScrollToMessage: (messageId: string) => void;
  onStartReply: (target: ReplyComposeTarget) => void;
};

export const MessageItem = memo(
  ({
    message,
    channel,
    index,
    selfIds,
    participantId,
    chronologicalMessages,
    showReadReceipt = false,
    onResend,
    onScrollToMessage,
    onStartReply,
  }: MessageItemProps) => {
    const { t } = useTranslation();
    const notification = useNotification();
    const [menuOpen, setMenuOpen] = useState(false);
    const [rowHovered, setRowHovered] = useState(false);
    const menuOpenRef = useRef(menuOpen);

    menuOpenRef.current = menuOpen;

    const actionsVisible = rowHovered || menuOpen;

    const isOwn = isOwnConversationMessage(message, {
      channel,
      selfIds,
      participantId,
      messages: chronologicalMessages,
    });

    const pendingOutbound = message.outboundStatus === "pending";
    const failedOutbound = message.outboundStatus === "failed";
    const clientTempId = message.clientTempId;
    const messageText = message.message ?? "";
    const webhookReaction = message.webhook_messaging?.reaction;
    const reactionEmoji =
      webhookReaction != null
        ? normalizeWebhookReactionEmoji(webhookReaction.emoji ?? "")
        : "";
    const showReactionBadge = reactionEmoji !== "";
    const timeLabel = formatMessageTime(message.created_time);
    const hasAttachments = (message.attachments?.data?.length ?? 0) > 0;
    const repliedTo = message.replied_to_message;
    const hasReplyQuote =
      repliedTo != null && (repliedTo.message?.trim() ?? "") !== "";
    const replyTargetId = message.reply_to_id ?? repliedTo?.id ?? "";
    const replyQuoteScrollable = hasReplyQuote && replyTargetId !== "";

    const handleReplyQuoteActivate = useCallback(() => {
      if (replyTargetId !== "") {
        onScrollToMessage(replyTargetId);
      }
    }, [onScrollToMessage, replyTargetId]);

    const canStartReply =
      message.id != null &&
      message.id !== "" &&
      !message.id.startsWith("local:") &&
      message.outboundStatus !== "pending";

    const replySnippet = useMemo(() => {
      const trimmed = messageText.trim();
      if (trimmed) {
        return trimmed.length > 80
          ? `${trimmed.slice(0, 80)}${t("messages.ellipsisSnippet")}`
          : trimmed;
      }
      if (hasAttachments) {
        return t("messages.attachmentSnippet");
      }
      return t("messages.ellipsisSnippet");
    }, [messageText, hasAttachments, t]);

    const handleReplyClick = useCallback(() => {
      if (!canStartReply) {
        return;
      }

      onStartReply({
        messageId: message.id,
        authorLabel: replyQuoteAuthorLabel(message.from),
        snippet: replySnippet,
      });
    }, [canStartReply, message.from, message.id, onStartReply, replySnippet]);

    const clipboardText = useMemo(
      () => getMessageClipboardText(message),
      [message],
    );
    const copyDisabled = clipboardText === "";

    const handleCopy = useCallback(async () => {
      const ok = await copyTextToClipboard(clipboardText);
      if (ok) {
        notification.success({ title: t("messages.copied") });
      } else {
        notification.error({ title: t("messages.copyFailed") });
      }
    }, [clipboardText, notification, t]);

    const menuItems: MenuProps["items"] = useMemo(
      () => [
        {
          key: "copy",
          label: t("messages.copy"),
          icon: <CopySimpleIcon size={16} weight="regular" />,
          disabled: copyDisabled,
          onClick: () => {
            void handleCopy();
          },
        },
        {
          key: "delete",
          label: t("messages.delete"),
          icon: <TrashIcon size={16} weight="regular" />,
          disabled: true,
        },
      ],
      [copyDisabled, handleCopy, t],
    );

    const showTextTimeRow =
      timeLabel !== "" ||
      messageText.trim().length > 0 ||
      hasAttachments ||
      showReactionBadge ||
      hasReplyQuote;

    const handleMessageRowMouseLeave = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (menuOpenRef.current) {
          return;
        }
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) {
          return;
        }
        setRowHovered(false);
      },
      [],
    );

    const handleMessageBubbleRowBlur = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        if (menuOpenRef.current) {
          return;
        }
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) {
          return;
        }
        setRowHovered(false);
      },
      [],
    );

    const handleDropdownOpenChange = useCallback((open: boolean) => {
      menuOpenRef.current = open;
      setMenuOpen(open);
      if (open) {
        setRowHovered(true);
      }
    }, []);

    return (
      <S.MessageRow
        $isOwn={isOwn}
        data-message-anchor={message.id}
        onMouseEnter={() => setRowHovered(true)}
        onMouseLeave={handleMessageRowMouseLeave}
      >
        <S.MessageWrap $isOwn={isOwn}>
          <S.MessageBubbleRow
            $isOwn={isOwn}
            onFocusCapture={() => setRowHovered(true)}
            onBlurCapture={handleMessageBubbleRowBlur}
          >
            <MessageInlineActions
              visible={actionsVisible}
              canReply={canStartReply}
              menuOpen={menuOpen}
              menuItems={menuItems}
              placement={isOwn ? "bottomLeft" : "bottomRight"}
              replyTooltip={t("messages.replyTooltip")}
              replyAria={t("messages.replyAria")}
              actionsAria={t("messages.actionsAria")}
              onReply={handleReplyClick}
              onDropdownOpenChange={handleDropdownOpenChange}
            />
            <S.MessageBubble
              $isOwn={isOwn}
              $channel={channel}
              $muted={pendingOutbound}
              $hasReaction={showReactionBadge}
            >
              {hasReplyQuote && repliedTo != null && (
                <MessageReplyQuote
                  message={repliedTo}
                  isOwn={isOwn}
                  scrollable={replyQuoteScrollable}
                  onActivate={handleReplyQuoteActivate}
                />
              )}

              <MessageAttachments
                messageId={message.id ?? clientTempId ?? `message-${index}`}
                attachments={message.attachments ?? { data: [] }}
              />

              {showTextTimeRow && (
                <S.TextTimeRow
                  $hasAttachments={hasAttachments}
                  $hasReply={hasReplyQuote}
                >
                  {messageText ? (
                    <Paragraph
                      className="conversation-message-body"
                      style={{ flex: 1, marginBottom: 0, minWidth: 0 }}
                    >
                      {messageText}
                    </Paragraph>
                  ) : (
                    <S.TextTimeSpacer aria-hidden />
                  )}
                  {timeLabel !== "" && (
                    <S.Timestamp $isOwn={isOwn}>{timeLabel}</S.Timestamp>
                  )}
                </S.TextTimeRow>
              )}

              {isOwn && failedOutbound && clientTempId != null && (
                <MessageFailureActions
                  error={message.sendError}
                  resendLabel={t("messages.resend")}
                  onResend={() => onResend(clientTempId)}
                />
              )}

              {showReactionBadge && (
                <S.ReactionBadge
                  $isOwn={isOwn}
                  role="img"
                  aria-label={t("messages.reactionAria", {
                    emoji: reactionEmoji,
                  })}
                >
                  {reactionEmoji}
                </S.ReactionBadge>
              )}
            </S.MessageBubble>
          </S.MessageBubbleRow>

          {showReadReceipt && isOwn && (
            <S.ReadReceipt $offsetForReaction={showReactionBadge}>
              {t("messages.seen")}
            </S.ReadReceipt>
          )}
        </S.MessageWrap>
      </S.MessageRow>
    );
  },
);

MessageItem.displayName = "MessageItem";
