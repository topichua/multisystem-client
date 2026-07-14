import { Button, Drawer, Flex, Spin, Typography } from "antd";
import {
  PencilSimpleIcon,
  ArrowLineUpRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import {
  getOrderDetailsPath,
  getClientDetailsPath,
  pagesMap,
} from "@/app/router/pages-map";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { clientsApi } from "@/features/clients/api/clients-api";
import type {
  Client,
  ClientLookupResponse,
  ClientsLookupParams,
} from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import type { SendMessagePayload } from "@/features/conversations/model/types";
import { ordersApi } from "@/features/orders/api/orders-api";
import type { ClientLastOrder } from "@/features/orders/model/order.types";
import type { CatalogVariant } from "@/features/products/model/product.types";
import {
  resolveSelfAccountId,
  resolveTelegramSelfAccountId,
  type ConversationOwnershipContext,
  type ConversationSelfIds,
} from "@/features/conversations/utils/conversation-message-ownership";
import { useEnsureIntegrationsLoaded } from "@/features/integrations/model/use-ensure-integrations-loaded";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import * as S from "./conversation-details.styled";
import { ClientOrderDrawer } from "./components/client-order-drawer/client-order-drawer";
import { CONVERSATION_CLIENT_EDIT_FORM_ID } from "./components/conversation-client-info-panel/__components/client-profile-edit-form";
import { ClientProfileHeader } from "./components/conversation-client-info-panel/__components/client-profile-header";
import { ConversationClientInfoPanel } from "./components/conversation-client-info-panel/conversation-client-info-panel";
import { Composer } from "./components/composer/composer";
import * as ComposerS from "./components/composer/composer.styled";
import { ConversationMessagesList } from "./components/conversation-messages-list/conversation-messages-list";
import { Header } from "./components/header/header";
import { ProductSuggestionsPanel } from "./components/product-suggestions/product-suggestions-panel";
import type { ReplyComposeTarget } from "./reply-compose-target";
import { scrollMessageAnchorIntoView } from "./scroll-to-message-anchor";
import { useConversationThread } from "./use-conversation-thread";

function areVariantIdSetsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const id of a) {
    if (!b.has(id)) {
      return false;
    }
  }

  return true;
}

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
  const [clientDrawerEditMode, setClientDrawerEditMode] = useState(false);
  const [clientLookup, setClientLookup] = useState<
    ClientLookupResponse | undefined
  >();
  const [clientLookupLoading, setClientLookupLoading] = useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [suggestedOrderVariant, setSuggestedOrderVariant] =
    useState<CatalogVariant | null>(null);
  const [orderDraftVariantIds, setOrderDraftVariantIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [clientLastOrder, setClientLastOrder] =
    useState<ClientLastOrder | null>(null);
  const [clientLastOrderLoading, setClientLastOrderLoading] = useState(false);
  const lastOrderRequestIdRef = useRef(0);

  const { conversations, sendConversationMessage, resendOutboundMessage } =
    useConversationsStore();
  const clientsStore = useClientsStore();

  const { company } = useUserStore();
  const integrationsStore = useIntegrationsStore();
  useEnsureIntegrationsLoaded();

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

  const linkedClientId = linkedClient?.id ?? null;

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

  const handleClientAssociationCleared = useCallback(() => {
    setClientLookup({
      associated: false,
      status: "",
    });
  }, []);

  const handleEditClient = useCallback(() => {
    if (linkedClientId == null) {
      return;
    }

    setClientDrawerEditMode(true);
  }, [linkedClientId]);

  const handleCloseClientPanel = useCallback(() => {
    setClientInfoOpen(false);
    setClientDrawerEditMode(false);
  }, []);

  const handleClientEditComplete = useCallback(() => {
    setClientDrawerEditMode(false);
  }, []);

  const handleCreateOrderClick = useCallback(() => {
    if (!activeConversation || !linkedClient) {
      return;
    }

    setOrderDrawerOpen(true);
  }, [activeConversation, linkedClient]);

  const handleAddSuggestedVariantToOrder = useCallback(
    (variant: CatalogVariant) => {
      if (!activeConversation || !linkedClient) {
        return;
      }

      setSuggestedOrderVariant(variant);
    },
    [activeConversation, linkedClient],
  );

  const handleSuggestedVariantConsumed = useCallback(() => {
    setSuggestedOrderVariant(null);
  }, []);

  const handleOrderDraftVariantIdsChange = useCallback(
    (variantIds: Set<number>) => {
      setOrderDraftVariantIds((prev) => {
        if (areVariantIdSetsEqual(prev, variantIds)) {
          return prev;
        }

        return new Set(variantIds);
      });
    },
    [],
  );

  const loadClientLastOrder = useCallback((clientId: number) => {
    const requestId = lastOrderRequestIdRef.current + 1;
    lastOrderRequestIdRef.current = requestId;
    setClientLastOrder(null);
    setClientLastOrderLoading(true);

    void ordersApi.getClientLastOrder(clientId).then(
      (order) => {
        if (lastOrderRequestIdRef.current === requestId) {
          setClientLastOrder(order);
          setClientLastOrderLoading(false);
        }
      },
      () => {
        if (lastOrderRequestIdRef.current === requestId) {
          setClientLastOrder(null);
          setClientLastOrderLoading(false);
        }
      },
    );
  }, []);

  const handleOpenLastOrder = useCallback(
    (orderId: number) => {
      navigate(getOrderDetailsPath(orderId));
    },
    [navigate],
  );

  const handleOrderCreated = useCallback(() => {
    if (linkedClientId == null) {
      return;
    }

    loadClientLastOrder(linkedClientId);
  }, [linkedClientId, loadClientLastOrder]);

  const handleCloseOrderDrawer = useCallback(() => {
    setSuggestedOrderVariant(null);
    setOrderDraftVariantIds(new Set());
    setOrderDrawerOpen(false);
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
    setOrderDrawerOpen(false);
    setSuggestedOrderVariant(null);
    setOrderDraftVariantIds(new Set());
  }, [conversationId]);

  useEffect(() => {
    setOrderDraftVariantIds(new Set());
  }, [linkedClientId]);

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

  useEffect(() => {
    if (linkedClientId == null) {
      lastOrderRequestIdRef.current += 1;
      setClientLastOrder(null);
      setClientLastOrderLoading(false);
      return;
    }

    loadClientLastOrder(linkedClientId);
  }, [linkedClientId, loadClientLastOrder]);

  if (!conversationId) {
    return null;
  }

  return (
    <S.Root>
      <S.ThreadColumn>
        <Header
          clientInfoOpen={clientInfoOpen}
          hasLinkedClient={linkedClient != null}
          clientLookupLoading={clientLookupLoading}
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

        <ComposerS.Composer>
          <ProductSuggestionsPanel
            conversationId={conversationId}
            clientId={linkedClientId}
            orderDraftVariantIds={orderDraftVariantIds}
            onAddToOrder={handleAddSuggestedVariantToOrder}
          />

          <Composer
            conversationId={conversationId}
            draft={draft}
            canSend={canSend}
            hasLinkedClient={linkedClient != null}
            clientLookupLoading={clientLookupLoading}
            clientLastOrder={clientLastOrder}
            clientLastOrderLoading={clientLastOrderLoading}
            replyPreview={replyTarget}
            onCancelReply={handleCancelReply}
            onCreateOrderClick={handleCreateOrderClick}
            onDraftChange={setDraft}
            onLastOrderOpen={handleOpenLastOrder}
            onSend={handleSend}
          />
        </ComposerS.Composer>
      </S.ThreadColumn>

      <Drawer
        title={
          linkedClient && activeConversation ? (
            <ClientProfileHeader
              client={linkedClient}
              conversation={activeConversation}
            />
          ) : (
            clientPanelTitle
          )
        }
        closable={{
          "aria-label": t("conversation.closeClientPanelAria"),
        }}
        extra={
          linkedClient && !clientDrawerEditMode ? (
            <Button
              type="text"
              aria-label={t("conversation.clientProfile.editAria")}
              icon={<PencilSimpleIcon size={18} />}
              onClick={handleEditClient}
            />
          ) : null
        }
        onClose={handleCloseClientPanel}
        open={clientInfoOpen}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : 360}
        height={
          isMobileViewport
            ? "calc(100dvh - env(safe-area-inset-top, 0px))"
            : undefined
        }
        destroyOnHidden
        footer={
          linkedClient ? (
            clientDrawerEditMode ? (
              <Flex gap={8} justify="flex-end">
                <Button onClick={() => setClientDrawerEditMode(false)}>
                  {t("conversation.clientProfile.cancelEdit")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  form={CONVERSATION_CLIENT_EDIT_FORM_ID}
                  loading={clientsStore.saveLoading}
                  icon={<CheckIcon size={16} />}
                >
                  {t("clients.save")}
                </Button>
              </Flex>
            ) : (
              <Button
                variant="outlined"
                block
                icon={<ArrowLineUpRightIcon />}
                onClick={() => navigate(getClientDetailsPath(linkedClient.id))}
              >
                {t("conversation.clientProfile.fullProfile")}
              </Button>
            )
          ) : undefined
        }
        styles={{
          body: {
            overflowY: "auto",
            padding: "16px 18px",
          },
          header: {
            padding: "16px 18px",
          },
          footer: {
            padding: "16px 18px",
          },
        }}
      >
        <ConversationClientInfoPanel
          conversation={activeConversation}
          clientLookup={clientLookup}
          linkedClient={linkedClient}
          clientLookupLoading={clientLookupLoading}
          clientInfoOpen={clientInfoOpen}
          editMode={clientDrawerEditMode}
          onClientCreated={handleClientCreated}
          onClientAssociationCleared={handleClientAssociationCleared}
          onEditComplete={handleClientEditComplete}
        />
      </Drawer>

      {activeConversation && linkedClient && (
        <ClientOrderDrawer
          onClose={handleCloseOrderDrawer}
          open={orderDrawerOpen}
          linkedClient={linkedClient}
          conversationId={activeConversation.id}
          clientPic={activeConversation.participant.profilePic ?? undefined}
          suggestedVariantToAdd={suggestedOrderVariant}
          onOrderDraftVariantIdsChange={handleOrderDraftVariantIdsChange}
          onSuggestedVariantConsumed={handleSuggestedVariantConsumed}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </S.Root>
  );
});
