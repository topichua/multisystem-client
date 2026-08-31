import {
  ArrowLeftIcon,
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  LockIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Button, Popover, Skeleton, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { ConversationAssigneeSelect } from "@/features/conversations/components/conversation-assignee-select";
import { ConversationGroupSelect } from "@/features/conversations/components/conversation-group-select";
import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ConversationFollowUpButton } from "./conversation-follow-up-button";
import * as S from "./header.styled";

const { Text } = Typography;

type HeaderProps = {
  clientInfoOpen?: boolean;
  hasLinkedClient?: boolean;
  clientBlocked?: boolean;
  clientLookupLoading?: boolean;
  conversationEventsOpen?: boolean;
  onBackToList?: () => void;
  onClientInfoOpen?: () => void;
  onConversationEventsOpen?: () => void;
};

export const Header = observer(
  ({
    clientInfoOpen,
    hasLinkedClient,
    clientBlocked = false,
    clientLookupLoading,
    conversationEventsOpen,
    onBackToList,
    onClientInfoOpen,
    onConversationEventsOpen,
  }: HeaderProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const { conversationId } = useParams();
    const { conversations } = useConversationsStore();
    const [actionsOpen, setActionsOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setActionsOpen(false);
    }, [conversationId]);

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
          <Text type="secondary" ellipsis>
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

    const clientInfoLabel = hasLinkedClient
      ? t("conversation.clientInfoTooltip")
      : t("conversation.createClientTooltip");
    const clientInfoAria = hasLinkedClient
      ? t("conversation.clientInfoAria")
      : t("conversation.createClientAria");

    const getMenuPopupContainer = (triggerNode: HTMLElement) =>
      actionsMenuRef.current ?? triggerNode.parentElement ?? document.body;

    const handleClientInfoOpen = () => {
      setActionsOpen(false);
      onClientInfoOpen?.();
    };

    const handleConversationEventsOpen = () => {
      setActionsOpen(false);
      onConversationEventsOpen?.();
    };

    const headerActions = (
      <>
        <ConversationGroupSelect
          conversationId={conversationId}
          groupId={conversation?.groupId ?? null}
          disabled={!conversation}
          showPlainLabels
          style={isMobileViewport ? { minWidth: 0, width: "100%" } : undefined}
          getPopupContainer={
            isMobileViewport ? getMenuPopupContainer : undefined
          }
        />

        <ConversationFollowUpButton
          conversationId={conversationId}
          followUp={conversation?.followUp ?? null}
          disabled={!conversation}
          getPopupContainer={
            isMobileViewport ? getMenuPopupContainer : undefined
          }
        />

        <ConversationAssigneeSelect
          conversationId={conversationId}
          responsibleMemberId={conversation?.responsibleMemberId ?? null}
          assignee={conversation?.assignee ?? null}
          disabled={!conversation}
          style={isMobileViewport ? { minWidth: 0, width: "100%" } : undefined}
          getPopupContainer={
            isMobileViewport ? getMenuPopupContainer : undefined
          }
        />

        <Button
          color={clientBlocked ? "danger" : "default"}
          variant={isMobileViewport || clientBlocked ? "filled" : "link"}
          icon={clientBlocked ? <LockIcon /> : <UserIcon />}
          aria-label={clientInfoAria}
          aria-pressed={clientInfoOpen}
          loading={clientLookupLoading}
          data-qa="layout-conversation-details-client-info-toggle"
          onClick={handleClientInfoOpen}
        >
          {clientInfoLabel}
          {isMobileViewport ? null : <CaretRightIcon />}
        </Button>
        <Button
          variant={isMobileViewport ? "filled" : "link"}
          color="default"
          icon={<ClockCounterClockwiseIcon size={18} />}
          aria-label={t("conversation.events.openAria")}
          aria-pressed={conversationEventsOpen}
          data-qa="layout-conversation-details-events-toggle"
          disabled={!conversationId || !onConversationEventsOpen}
          onClick={handleConversationEventsOpen}
        >
          {isMobileViewport ? t("conversation.events.title") : null}
        </Button>
      </>
    );

    return (
      <S.Header>
        {onBackToList && (
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("conversations.mobile.backToListAria")}
            data-qa="conversations-mobile-detail-back"
            onClick={onBackToList}
          />
        )}

        {participantAvatar}

        <S.HeaderText>{participantInfo}</S.HeaderText>

        <S.HeaderAside>
          {isMobileViewport ? (
            <Popover
              arrow={false}
              trigger="click"
              placement="bottomRight"
              open={actionsOpen}
              destroyOnHidden
              styles={{ container: { padding: 8, overflow: "visible" } }}
              content={
                <S.HeaderActionsMenu
                  ref={actionsMenuRef}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {headerActions}
                </S.HeaderActionsMenu>
              }
              onOpenChange={setActionsOpen}
            >
              <S.HeaderMoreButton
                type="text"
                icon={<DotsThreeIcon size={24} />}
                aria-label={t("conversations.mobile.headerActionsAria")}
                aria-expanded={actionsOpen}
                data-qa="layout-conversation-details-header-more"
              />
            </Popover>
          ) : (
            headerActions
          )}
        </S.HeaderAside>
      </S.Header>
    );
  },
);
