import { Avatar, Badge, Button, Dropdown, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import type { MouseEvent } from "react";
import { useRef, useState } from "react";

import type { Conversation as ConversationModel } from "@/features/conversations/model/types";

import { useConversationCardMenuItems } from "./conversation-card-menu";
import * as S from "./conversation.styled";
import ThreeDots from "./ThreeDotsIcon.svg?react";
import { useTranslation } from "react-i18next";

import { formatRelativeTimeShort } from "@/utils/date-time";

const { Title, Text } = Typography;

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
    const { t } = useTranslation();
    const conversationCardMenuItems = useConversationCardMenuItems();
    const [isHovered, setIsHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const showActions = isHovered || menuOpen;
    const actionsRef = useRef<HTMLSpanElement>(null);

    const handleRowActivate = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (actionsRef.current?.contains(target)) {
        return;
      }
      onNavigate(conversation.id);
      onSelect?.();
    };

    return (
      <S.ConversationCardOuter
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleRowActivate}
      >
        <S.ConversationCard
          size="small"
          hoverable
          $isSelected={conversationId === String(conversation.id)}
        >
          <Flex
            justify="space-between"
            align="center"
            gap={12}
            style={{ minWidth: 0 }}
          >
            <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
              <Avatar
                size={56}
                src={conversation.participant.profilePic || undefined}
                style={{ flexShrink: 0 }}
              />
              <Flex vertical gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Title
                  level={5}
                  style={{
                    marginTop: 0,
                    marginBottom: 0,
                    fontWeight: conversation.isUnread ? 900 : 500,
                  }}
                >
                  {conversation.participant.name}
                </Title>
                <Flex
                  align="center"
                  gap={4}
                  style={{ width: "100%", minWidth: 0 }}
                >
                  {conversation.lastMessage ? (
                    <>
                      <Text
                        ellipsis
                        type="secondary"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: conversation.isUnread ? 600 : 400,
                        }}
                      >
                        {conversation.isLastMessageFromMe
                          ? `${t("conversations.youPrefix")} `
                          : ""}
                        {conversation.lastMessage}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          flexShrink: 0,
                          fontWeight: conversation.isUnread ? 600 : 400,
                        }}
                      >
                        ·
                      </Text>
                    </>
                  ) : null}
                  <Text
                    type="secondary"
                    style={{
                      flexShrink: 0,
                      fontWeight: conversation.isUnread ? 600 : 400,
                    }}
                  >
                    {formatRelativeTimeShort(conversation.instUpdatedAt)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>

            <S.ConversationActionsHitbox
              ref={actionsRef}
              data-conversation-actions
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {conversation.isUnread && <Badge status="processing" />}
              {showActions && (
                <Dropdown
                  menu={{ items: conversationCardMenuItems }}
                  trigger={["click"]}
                  onOpenChange={setMenuOpen}
                >
                  <Button
                    type="text"
                    size="small"
                    aria-label={t("conversations.rowActionsAria")}
                    aria-expanded={menuOpen}
                    icon={<ThreeDots width={24} height={24} aria-hidden />}
                  />
                </Dropdown>
              )}
            </S.ConversationActionsHitbox>
          </Flex>
        </S.ConversationCard>
      </S.ConversationCardOuter>
    );
  },
);
