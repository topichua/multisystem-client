import { Flex, theme } from "antd";
import { observer } from "mobx-react-lite";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Conversation as ConversationModel } from "@/features/conversations/model/types";
import { formatRelativeTimeShort } from "@/utils/date-time";

import { ConversationRowActions } from "./components/conversation-row-actions";
import { ConversationRowAvatar } from "./components/conversation-row-avatar";
import { ConversationRowHeader } from "./components/conversation-row-header";
import { ConversationRowMeta } from "./components/conversation-row-meta";
import { ConversationRowPreview } from "./components/conversation-row-preview";
import * as S from "./conversation.styled";

type ConversationRowProps = {
  conversation: ConversationModel;
  conversationId: string | undefined;
  onNavigate: (id: number) => void;
  onSelect?: () => void;
};

export const ConversationRow = observer(
  ({
    conversation,
    conversationId,
    onNavigate,
    onSelect,
  }: ConversationRowProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { t } = useTranslation();
    const { token } = theme.useToken();

    const conversationCardMenuItems = [
      { key: "mute", label: t("conversations.markRead") },
      { key: "delete", label: t("conversations.delete"), danger: true },
    ];

    const hasUnreadMessages = conversation.unreadCount > 0;
    const showActions = isHovered || isMenuOpen;
    const messagePreview = conversation.lastMessage
      ? `${conversation.isLastMessageFromMe ? `${t("conversations.youPrefix")} ` : ""}${conversation.lastMessage}`
      : "";

    const handleNavigate = (): void => {
      onNavigate(conversation.id);
      onSelect?.();
    };

    const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleNavigate();
    };

    const stopRowActivation = (event: SyntheticEvent): void => {
      event.stopPropagation();
    };

    return (
      <S.ConversationRow
        role="button"
        tabIndex={0}
        $isSelected={conversationId === String(conversation.id)}
        $selectionColor={token.colorPrimary}
        onClick={handleNavigate}
        onKeyDown={handleRowKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Flex align="flex-start" gap={12}>
          <ConversationRowAvatar
            participant={conversation.participant}
            channel={conversation.channel}
          />

          <Flex
            vertical
            gap={0}
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <ConversationRowHeader
              participantName={conversation.participant.name}
              timestamp={formatRelativeTimeShort(conversation.instUpdatedAt)}
              hasUnreadMessages={hasUnreadMessages}
            />
            <ConversationRowPreview
              messagePreview={messagePreview}
              unreadCount={conversation.unreadCount}
              hasUnreadMessages={hasUnreadMessages}
              badgeColor={token.colorPrimary}
            />
            <ConversationRowMeta
              status={conversation.status}
              assignee={conversation.assignee}
              emptyAssigneeColor={token.colorTextTertiary}
            />
          </Flex>
        </Flex>

        {showActions && (
          <ConversationRowActions
            menuItems={conversationCardMenuItems}
            menuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            onStopRowActivation={stopRowActivation}
          />
        )}
      </S.ConversationRow>
    );
  },
);
