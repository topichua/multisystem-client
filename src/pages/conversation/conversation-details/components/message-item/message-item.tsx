import {
  ArrowBendDoubleUpLeftIcon,
  CopySimpleIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Button,
  Dropdown,
  Flex,
  message as antdMessage,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { ConversationMessage } from "@/features/conversations/model/types";
import type { ReplyComposeTarget } from "../../reply-compose-target";
import { MessageAttachments } from "../message-attachments/message-attachments";
import {
  copyTextToClipboard,
  getMessageClipboardText,
} from "./copy-message-to-clipboard";
import * as S from "./message-item.styled";
import { normalizeWebhookReactionEmoji } from "./normalize-webhook-reaction-emoji";
import { replyQuoteAuthorLabel } from "./reply-quote-author-label";
import { formatMessageTime } from "@/utils/date-time";

const { Text, Paragraph } = Typography;

type MessageItemProps = {
  message: ConversationMessage;
  index: number;
  selfInstagramId: string | number | null;
  showReadReceipt?: boolean;
  onResend: (clientTempId: string) => void;
  onScrollToMessage: (messageId: string) => void;
  onStartReply: (target: ReplyComposeTarget) => void;
};

export const MessageItem = memo(
  ({
    message,
    index,
    selfInstagramId,
    showReadReceipt = false,
    onResend,
    onScrollToMessage,
    onStartReply,
  }: MessageItemProps) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [rowHovered, setRowHovered] = useState(false);
    const menuOpenRef = useRef(menuOpen);

    menuOpenRef.current = menuOpen;

    const actionsVisible = rowHovered || menuOpen;

    const fromId = message.from?.id ?? null;
    const isOwn =
      selfInstagramId != null &&
      fromId != null &&
      String(fromId) === String(selfInstagramId);

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
        antdMessage.success(t("messages.copied"));
      } else {
        antdMessage.error(t("messages.copyFailed"));
      }
    }, [clipboardText, t]);

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
            <S.MessageInlineActions
              $visible={actionsVisible}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {canStartReply && (
                <Tooltip
                  title={t("messages.replyTooltip")}
                  mouseEnterDelay={0.35}
                >
                  <S.IconHitButton
                    type="button"
                    onClick={handleReplyClick}
                    aria-label={t("messages.replyAria")}
                  >
                    <ArrowBendDoubleUpLeftIcon size={20} weight="regular" />
                  </S.IconHitButton>
                </Tooltip>
              )}
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement={isOwn ? "bottomLeft" : "bottomRight"}
                onOpenChange={handleDropdownOpenChange}
              >
                <S.IconHitButton
                  type="button"
                  aria-label={t("messages.actionsAria")}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <DotsThreeVerticalIcon size={20} weight="regular" />
                </S.IconHitButton>
              </Dropdown>
            </S.MessageInlineActions>
            <S.MessageBubble
              $isOwn={isOwn}
              $muted={pendingOutbound}
              $hasReaction={showReactionBadge}
            >
              {hasReplyQuote && repliedTo != null && (
                <S.ReplyQuote
                  $isOwn={isOwn}
                  $interactive={replyQuoteScrollable}
                  role={replyQuoteScrollable ? "button" : undefined}
                  tabIndex={replyQuoteScrollable ? 0 : undefined}
                  onClick={
                    replyQuoteScrollable ? handleReplyQuoteActivate : undefined
                  }
                  onKeyDown={
                    replyQuoteScrollable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleReplyQuoteActivate();
                          }
                        }
                      : undefined
                  }
                >
                  <S.ReplyQuoteAuthor $isOwn={isOwn}>
                    {replyQuoteAuthorLabel(repliedTo.from)}
                  </S.ReplyQuoteAuthor>
                  <S.ReplyQuoteText $isOwn={isOwn}>
                    {repliedTo.message}
                  </S.ReplyQuoteText>
                </S.ReplyQuote>
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
                <Flex
                  align="center"
                  gap={8}
                  wrap="wrap"
                  style={{ marginTop: 8 }}
                >
                  {message.sendError != null && message.sendError !== "" && (
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {message.sendError}
                    </Text>
                  )}

                  <Button
                    type="link"
                    size="small"
                    onClick={() => onResend(clientTempId)}
                  >
                    {t("messages.resend")}
                  </Button>
                </Flex>
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
