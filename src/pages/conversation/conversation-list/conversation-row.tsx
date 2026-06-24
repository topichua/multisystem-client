import { Flex, theme } from "antd";
import { observer } from "mobx-react-lite";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";
import type { Conversation as ConversationModel } from "@/features/conversations/model/types";
import { getWorkspaceMemberAssignee } from "@/features/conversations/utils/conversation-assignee";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
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
    const groupsStore = useConversationGroupsStore();
    const membersStore = useWorkspaceMembersStore();

    const hasUnreadMessages = conversation.unreadCount > 0;
    const showActions = isHovered || isMenuOpen;
    const conversationCardMenuItems = useMemo(
      () => [
        { key: "mute", label: t("conversations.markRead") },
        { key: "delete", label: t("conversations.delete"), danger: true },
      ],
      [t],
    );
    const messagePreview = useMemo(() => {
      if (!conversation.lastMessage) {
        return "";
      }

      return `${conversation.isLastMessageFromMe ? `${t("conversations.youPrefix")} ` : ""}${conversation.lastMessage}`;
    }, [conversation.isLastMessageFromMe, conversation.lastMessage, t]);
    const group = useMemo(
      () =>
        conversation.groupId == null
          ? null
          : (groupsStore.groups.find(
              (item) => item.id === conversation.groupId,
            ) ?? null),
      [conversation.groupId, groupsStore.groups],
    );
    const assignee = useMemo(() => {
      if (conversation.assignee) {
        return conversation.assignee;
      }

      if (conversation.responsibleMemberId == null) {
        return null;
      }

      const responsibleMember = membersStore.members.find(
        (member) => member.id === conversation.responsibleMemberId,
      );

      return responsibleMember
        ? getWorkspaceMemberAssignee(responsibleMember)
        : {
            id: conversation.responsibleMemberId,
            name: `#${conversation.responsibleMemberId}`,
            profilePic: null,
          };
    }, [
      conversation.assignee,
      conversation.responsibleMemberId,
      membersStore.members,
    ]);

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
            source={conversation.source}
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
              group={group}
              assignee={assignee}
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
