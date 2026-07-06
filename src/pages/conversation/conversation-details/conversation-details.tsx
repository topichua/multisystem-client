import { Drawer, Flex, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { clientsApi } from "@/features/clients/api/clients-api";
import type {
  Client,
  ClientLookupResponse,
  ClientsLookupParams,
} from "@/features/clients/model/client.types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import type { SendMessagePayload } from "@/features/conversations/model/types";
import {
  resolveSelfAccountId,
  resolveTelegramSelfAccountId,
  type ConversationOwnershipContext,
  type ConversationSelfIds,
} from "@/features/conversations/utils/conversation-message-ownership";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import * as S from "./conversation-details.styled";
import { ConversationClientInfoPanel } from "./components/conversation-client-info-panel/conversation-client-info-panel";
import { Composer } from "./components/composer/composer";
import { ConversationMessagesList } from "./components/conversation-messages-list/conversation-messages-list";
import { Header } from "./components/header/header";
import type { ReplyComposeTarget } from "./reply-compose-target";
import { scrollMessageAnchorIntoView } from "./scroll-to-message-anchor";
import { useConversationThread } from "./use-conversation-thread";

const { Text } = Typography;

export const ConversationDetails = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const isMobileViewport = useIsMobileViewport();
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyComposeTarget | null>(
    null,
  );
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [clientLookup, setClientLookup] = useState<
    ClientLookupResponse | undefined
  >();
  const [clientLookupLoading, setClientLookupLoading] = useState(false);

  const { conversations, sendConversationMessage, resendOutboundMessage } =
    useConversationsStore();

  const { company } = useUserStore();
  const integrationsStore = useIntegrationsStore();

  const activeConversation = useMemo(
    () =>
      conversationId
        ? conversations.find((c) => String(c.id) === conversationId)
        : undefined,
    [conversations, conversationId],
  );

  const integrationTelegramAccountId = useMemo(() => {
    const telegramIntegration = integrationsStore.items.find(
      (item) => item.type === "telegram",
    );

    return telegramIntegration?.businessAccountId ?? null;
  }, [integrationsStore.items]);

  const participantId = activeConversation?.participant.id ?? null;

  const selfIds = useMemo(
    (): ConversationSelfIds => ({
      instagram: company?.instagramAccountId ?? null,
      telegram: integrationTelegramAccountId,
    }),
    [company?.instagramAccountId, integrationTelegramAccountId],
  );

  const ownershipContext = useMemo(
    (): ConversationOwnershipContext => ({
      channel: activeConversation?.channel,
      selfIds,
      participantId,
    }),
    [activeConversation?.channel, participantId, selfIds],
  );

  const thread = useConversationThread(conversationId, ownershipContext);

  const resolvedSelfIds = useMemo(
    (): ConversationSelfIds => ({
      instagram: selfIds.instagram,
      telegram: resolveTelegramSelfAccountId(
        thread.chronologicalMessages,
        selfIds.telegram,
        participantId,
      ),
    }),
    [participantId, selfIds, thread.chronologicalMessages],
  );

  const sentBy = useMemo(() => {
    if (!company) {
      return undefined;
    }

    if (activeConversation?.channel === "telegram") {
      const telegramAccountId = resolveSelfAccountId({
        channel: "telegram",
        selfIds,
        participantId,
        messages: thread.chronologicalMessages,
      });

      if (telegramAccountId != null) {
        return { id: telegramAccountId, name: company.name };
      }

      return undefined;
    }

    if (company.instagramAccountId != null) {
      return { id: String(company.instagramAccountId), name: company.name };
    }

    return undefined;
  }, [
    activeConversation?.channel,
    company,
    participantId,
    selfIds,
    thread.chronologicalMessages,
  ]);

  const canSend = Boolean(draft.trim());

  const participantSocialId =
    activeConversation?.participant.id != null
      ? String(activeConversation.participant.id)
      : undefined;
  const conversationChannel = activeConversation?.channel;

  const clientLookupParams = useMemo((): ClientsLookupParams | undefined => {
    if (conversationChannel == null || participantSocialId == null) {
      return undefined;
    }

    if (conversationChannel === "telegram") {
      return { telegramUserId: participantSocialId };
    }

    return { instagramId: participantSocialId };
  }, [conversationChannel, participantSocialId]);

  const linkedClient = useMemo(() => {
    if (!clientLookup?.associated) {
      return undefined;
    }

    return clientLookup.client;
  }, [clientLookup]);

  const clientPanelTitle = useMemo(() => {
    const showNotLinkedHint =
      !clientLookupLoading && clientLookup && !clientLookup.associated;

    if (!showNotLinkedHint) {
      return t("conversation.clientPanelTitle");
    }

    return (
      <Flex vertical gap={2}>
        <span>{t("conversation.clientPanelTitle")}</span>
        <Text
          type="secondary"
          style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.45 }}
          data-qa="layout-conversation-details-client-not-linked-hint"
        >
          {t("conversation.clientNotLinked")}
        </Text>
      </Flex>
    );
  }, [clientLookup, clientLookupLoading, t]);

  const handleClientCreated = useCallback((created: Client) => {
    setClientLookupLoading(false);
    setClientLookup({
      associated: true,
      status: "ok",
      client: created,
    });
  }, []);

  const handleStartReply = useCallback((target: ReplyComposeTarget) => {
    setReplyTarget(target);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleSend = useCallback(() => {
    const text = draft.trim();

    if (!conversationId || !text) {
      return;
    }

    setDraft("");
    const payload: SendMessagePayload = {
      message: text,
      ...(replyTarget != null && replyTarget.messageId !== ""
        ? { reply_to_id: replyTarget.messageId }
        : {}),
    };
    void sendConversationMessage(conversationId, payload, sentBy);
    setReplyTarget(null);
  }, [conversationId, draft, replyTarget, sendConversationMessage, sentBy]);

  const handleResend = useCallback(
    (clientTempId: string) => {
      if (!conversationId) {
        return;
      }

      void resendOutboundMessage(conversationId, clientTempId, sentBy);
    },
    [conversationId, resendOutboundMessage, sentBy],
  );

  const scrollToMessage = useCallback(
    (messageId: string) => {
      scrollMessageAnchorIntoView(thread.messagesScrollRef.current, messageId);
    },
    [thread.messagesScrollRef],
  );

  useEffect(() => {
    void integrationsStore.loadIntegrations({ silent: true });
  }, [integrationsStore]);

  useEffect(() => {
    setReplyTarget(null);
    setClientInfoOpen(false);
  }, [conversationId]);

  useEffect(() => {
    if (!clientLookupParams) {
      setClientLookup(undefined);
      setClientLookupLoading(false);
      return;
    }

    let cancelled = false;
    setClientLookup(undefined);
    setClientLookupLoading(true);

    void clientsApi.lookupClient(clientLookupParams).then(
      (body) => {
        if (!cancelled) {
          setClientLookup(body);
          setClientLookupLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setClientLookup(undefined);
          setClientLookupLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [clientLookupParams]);

  if (!conversationId) {
    return null;
  }

  return (
    <S.Root>
      <S.ThreadColumn>
        <Header
          clientInfoOpen={clientInfoOpen}
          onBackToList={
            isMobileViewport
              ? () => navigate(pagesMap.conversations)
              : undefined
          }
          onClientInfoOpen={() => setClientInfoOpen(true)}
        />

        <S.MessagesScroll
          ref={thread.messagesScrollRef}
          onScroll={thread.handleMessagesScroll}
        >
          {thread.messagesError && (
            <Text type="danger" role="alert">
              {thread.messagesError}
            </Text>
          )}

          {thread.loadingMessages ? (
            <Flex
              justify="center"
              align="center"
              style={{ flex: 1, minHeight: 160 }}
            >
              <Spin />
            </Flex>
          ) : thread.messagesLength === 0 ? (
            <Flex justify="center">
              <Text type="secondary">{t("conversations.noMessages")}</Text>
            </Flex>
          ) : (
            <ConversationMessagesList
              chronologicalMessages={thread.chronologicalMessages}
              channel={activeConversation?.channel}
              selfIds={resolvedSelfIds}
              participantId={participantId}
              loadingOlderMessages={thread.loadingOlderMessages}
              lastOwnMessageIndex={thread.lastOwnMessageIndex}
              onResend={handleResend}
              onScrollToMessage={scrollToMessage}
              onStartReply={handleStartReply}
            />
          )}
        </S.MessagesScroll>

        <Composer
          conversationId={conversationId}
          draft={draft}
          canSend={canSend}
          hasLinkedClient={linkedClient != null}
          clientLookupLoading={clientLookupLoading}
          replyPreview={replyTarget}
          onCancelReply={handleCancelReply}
          onDraftChange={setDraft}
          onSend={handleSend}
        />
      </S.ThreadColumn>

      <Drawer
        title={clientPanelTitle}
        closable={{
          "aria-label": t("conversation.closeClientPanelAria"),
        }}
        onClose={() => setClientInfoOpen(false)}
        open={clientInfoOpen}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : 380}
        height={
          isMobileViewport
            ? "calc(100dvh - env(safe-area-inset-top, 0px))"
            : undefined
        }
        destroyOnHidden
        styles={{
          body: {
            overflowY: "auto",
          },
        }}
      >
        <ConversationClientInfoPanel
          conversation={activeConversation}
          clientLookup={clientLookup}
          linkedClient={linkedClient}
          clientLookupLoading={clientLookupLoading}
          clientInfoOpen={clientInfoOpen}
          onClientCreated={handleClientCreated}
        />
      </Drawer>
    </S.Root>
  );
});
