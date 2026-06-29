import { ArrowLeftIcon, CaretRightIcon, UserIcon } from "@phosphor-icons/react";
import { Button, Skeleton, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { ConversationAssigneeSelect } from "@/features/conversations/components/conversation-assignee-select";
import { ConversationGroupSelect } from "@/features/conversations/components/conversation-group-select";
import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import * as S from "./header.styled";

const { Text } = Typography;

type HeaderProps = {
  clientInfoOpen?: boolean;
  onBackToList?: () => void;
  onClientInfoOpen?: () => void;
};

export const Header = observer(
  ({ clientInfoOpen, onBackToList, onClientInfoOpen }: HeaderProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const { conversationId } = useParams();
    const { conversations } = useConversationsStore();

    const conversation = conversations.find(
      ({ id }) => String(id) === conversationId,
    );

    const participant = conversation?.participant;
    const title = participant?.name || t("conversation.fallbackTitle");
    const username = participant?.username ? `@${participant.username}` : null;

    const participantAvatar = conversation ? (
      <ConversationParticipantAvatar
        participant={conversation.participant}
        source={conversation.source}
        size={40}
      />
    ) : (
      <Skeleton.Avatar active size={40} />
    );

    const participantInfo = participant ? (
      <>
        <Text strong ellipsis style={{ fontSize: 16, lineHeight: 1.3 }}>
          {title}
        </Text>

        {username && (
          <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
            {username}
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
    );

    return (
      <S.Header>
        {onBackToList ? (
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("conversations.mobile.backToListAria")}
            data-qa="conversations-mobile-detail-back"
            onClick={onBackToList}
          />
        ) : null}

        {participantAvatar}

        <S.HeaderText>{participantInfo}</S.HeaderText>

        <S.HeaderAside>
          <ConversationGroupSelect
            conversationId={conversationId}
            groupId={conversation?.groupId ?? null}
            disabled={!conversation}
            showPlainLabels
            style={
              isMobileViewport ? { minWidth: 0, width: "100%" } : undefined
            }
          />

          <ConversationAssigneeSelect
            conversationId={conversationId}
            responsibleMemberId={conversation?.responsibleMemberId ?? null}
            assignee={conversation?.assignee ?? null}
            disabled={!conversation}
            style={
              isMobileViewport ? { minWidth: 0, width: "100%" } : undefined
            }
          />

          <Button
            color="default"
            variant={isMobileViewport ? "filled" : "link"}
            icon={<UserIcon />}
            aria-label={t("conversation.clientInfoAria")}
            aria-pressed={clientInfoOpen}
            data-qa="layout-conversation-details-client-info-toggle"
            onClick={onClientInfoOpen}
          >
            {isMobileViewport ? null : t("conversation.clientInfoTooltip")}
            {isMobileViewport ? null : <CaretRightIcon />}
          </Button>
        </S.HeaderAside>
      </S.Header>
    );
  },
);
