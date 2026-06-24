import { CaretRightIcon, UserIcon } from "@phosphor-icons/react";
import { Button, Skeleton, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { ConversationAssigneeSelect } from "@/features/conversations/components/conversation-assignee-select";
import { ConversationGroupSelect } from "@/features/conversations/components/conversation-group-select";
import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import * as S from "./header.styled";

const { Text } = Typography;

type HeaderProps = {
  clientInfoOpen?: boolean;
  onClientInfoToggle?: () => void;
};

export const Header = observer(
  ({ clientInfoOpen, onClientInfoToggle }: HeaderProps) => {
    const { t } = useTranslation();
    const { conversationId } = useParams();
    const { conversations } = useConversationsStore();

    const peer = useMemo(
      () => conversations.find((c) => String(c.id) === conversationId),
      [conversations, conversationId],
    );

    const titleName = peer?.participant.name ?? t("conversation.fallbackTitle");
    const subtitle = peer?.participant.username
      ? `@${peer.participant.username}`
      : null;

    return (
      <S.Header>
        {peer ? (
          <ConversationParticipantAvatar
            participant={peer.participant}
            source={peer.source}
            size={40}
          />
        ) : (
          <Skeleton.Avatar active size={40} />
        )}
        <S.HeaderText>
          {peer ? (
            <>
              <Text strong ellipsis style={{ fontSize: 16, lineHeight: 1.3 }}>
                {titleName}
              </Text>
              {subtitle && (
                <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                  {subtitle}
                </Text>
              )}
            </>
          ) : (
            <>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 160, height: 18 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, height: 14 }}
              />
            </>
          )}
        </S.HeaderText>
        {conversationId ? (
          <S.HeaderAside>
            <ConversationGroupSelect
              conversationId={conversationId}
              groupId={peer?.groupId ?? null}
              disabled={!peer}
              showPlainLabels={true}
            />
            <ConversationAssigneeSelect
              conversationId={conversationId}
              responsibleMemberId={peer?.responsibleMemberId ?? null}
              assignee={peer?.assignee ?? null}
              disabled={!peer}
            />
            {onClientInfoToggle ? (
              <Button
                color="default"
                variant="link"
                icon={<UserIcon />}
                aria-label={t("conversation.clientInfoAria")}
                aria-pressed={clientInfoOpen}
                data-qa="layout-conversation-details-client-info-toggle"
                onClick={onClientInfoToggle}
              >
                {t("conversation.clientInfoTooltip")} <CaretRightIcon />
              </Button>
            ) : null}
          </S.HeaderAside>
        ) : null}
      </S.Header>
    );
  },
);
