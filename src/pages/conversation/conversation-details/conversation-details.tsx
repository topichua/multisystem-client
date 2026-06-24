import { Flex, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { useUserStore } from "@/features/auth/model/use-user-store";
import { clientsApi } from "@/features/clients/api/clients-api";
import { instagramUserIdToApiString } from "@/features/clients/model/client-instagram-payload";
import type {
  Client,
  ClientInstagramAssociationResponse,
} from "@/features/clients/model/client.types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import type { SendMessagePayload } from "@/features/conversations/model/types";

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
  const { conversationId } = useParams();
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyComposeTarget | null>(
    null,
  );
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [instagramAssociation, setInstagramAssociation] = useState<
    ClientInstagramAssociationResponse | undefined
  >();
  const [linkedFromList, setLinkedFromList] = useState<{
    loading: boolean;
    client?: Client;
  }>({
    loading: false,
  });

  const { conversations, sendConversationMessage, resendOutboundMessage } =
    useConversationsStore();

  const { company } = useUserStore();

  const sentBy = useMemo(
    () =>
      company?.instagramAccountId != null
        ? { id: company.instagramAccountId, name: company.name }
        : undefined,
    [company],
  );

  const selfInstagramId = company?.instagramAccountId ?? null;

  const thread = useConversationThread(conversationId, selfInstagramId);

  const canSend = Boolean(draft.trim());

  const activeConversation = useMemo(
    () =>
      conversationId
        ? conversations.find((c) => String(c.id) === conversationId)
        : undefined,
    [conversations, conversationId],
  );

  const participantInstagramId =
    activeConversation?.participant.id != null
      ? String(activeConversation.participant.id)
      : undefined;

  const linkedClient = useMemo(() => {
    if (!instagramAssociation?.associated) {
      return undefined;
    }
    return instagramAssociation.client ?? linkedFromList.client;
  }, [instagramAssociation, linkedFromList.client]);

  const linkedClientLoading = Boolean(
    instagramAssociation?.associated &&
    !instagramAssociation.client &&
    linkedFromList.loading,
  );

  const handleClientCreated = useCallback((created: Client) => {
    setLinkedFromList({ loading: false, client: created });
    setInstagramAssociation({
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
    setReplyTarget(null);
    setClientInfoOpen(false);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !participantInstagramId) {
      return;
    }

    let cancelled = false;
    setInstagramAssociation(undefined);

    void clientsApi.checkInstagramAssociation(participantInstagramId).then(
      (body) => {
        if (!cancelled) {
          setInstagramAssociation(body);
        }
      },
      () => {
        if (!cancelled) {
          setInstagramAssociation(undefined);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [conversationId, participantInstagramId]);

  useEffect(() => {
    if (
      !instagramAssociation?.associated ||
      instagramAssociation.client ||
      !participantInstagramId
    ) {
      setLinkedFromList({ loading: false, client: undefined });
      return;
    }

    let cancelled = false;
    setLinkedFromList({ loading: true, client: undefined });

    void clientsApi.list().then(
      (list) => {
        const found = list.find(
          (c) =>
            instagramUserIdToApiString(c.instagramUserId) ===
            participantInstagramId,
        );
        if (!cancelled) {
          setLinkedFromList({ loading: false, client: found });
        }
      },
      () => {
        if (!cancelled) {
          setLinkedFromList({ loading: false, client: undefined });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [instagramAssociation, participantInstagramId]);

  if (!conversationId) {
    return null;
  }

  return (
    <S.Root>
      <S.ThreadColumn>
        <Header
          clientInfoOpen={clientInfoOpen}
          onClientInfoToggle={() => setClientInfoOpen((v) => !v)}
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
              selfInstagramId={selfInstagramId}
              loadingOlderMessages={thread.loadingOlderMessages}
              lastOwnMessageIndex={thread.lastOwnMessageIndex}
              onResend={handleResend}
              onScrollToMessage={scrollToMessage}
              onStartReply={handleStartReply}
            />
          )}
        </S.MessagesScroll>

        <Composer
          draft={draft}
          canSend={canSend}
          replyPreview={replyTarget}
          onCancelReply={handleCancelReply}
          onDraftChange={setDraft}
          onSend={handleSend}
        />
      </S.ThreadColumn>

      {clientInfoOpen ? (
        <ConversationClientInfoPanel
          conversation={activeConversation}
          instagramAssociation={instagramAssociation}
          linkedClient={linkedClient}
          linkedClientLoading={linkedClientLoading}
          onClientCreated={handleClientCreated}
          onClose={() => setClientInfoOpen(false)}
        />
      ) : null}
    </S.Root>
  );
});
