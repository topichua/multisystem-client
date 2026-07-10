import { Avatar, Button, Col, Form, Input, Row, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type {
  Client,
  ClientLookupResponse,
} from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import type { Conversation } from "@/features/conversations/model/types";
import { useNotification } from "@/shared/components/notification/use-notification";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";
import { phoneFieldRules } from "@/utils/phone-input";

import { ClientProfileDrawerView } from "./__components/client-profile-drawer-view";
import {
  ClientProfileEditForm,
  type ClientProfileEditFormValues,
} from "./__components/client-profile-edit-form";
import { LinkExistingClientSection } from "./__components/link-existing-client-section";
import { useConversationClientDetails } from "./hooks/use-conversation-client-details";
import { useConversationLinkExistingClient } from "./hooks/use-conversation-link-existing-client";
import * as S from "./conversation-client-info-panel.styled";

const { Text } = Typography;

type ClientFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
};

function participantAvatarInitials(
  conversation: Conversation,
  linkedClient?: Client,
): string {
  if (linkedClient) {
    const s =
      `${linkedClient.firstName?.[0] ?? ""}${linkedClient.lastName?.[0] ?? ""}`.trim();
    if (s) return s.toUpperCase();
  }
  const { first, last } = splitParticipantName(conversation.participant.name);
  const fromName = `${first[0] ?? ""}${last[0] ?? ""}`.trim();
  if (fromName) return fromName.toUpperCase();
  const u = conversation.participant.username;
  if (u && u.length >= 2) return u.slice(0, 2).toUpperCase();
  if (u && u.length === 1) return u.toUpperCase();
  return "?";
}

function splitParticipantName(name: string): { first: string; last: string } {
  const t = name.trim();
  if (!t) {
    return { first: "", last: "" };
  }
  const i = t.indexOf(" ");
  if (i === -1) {
    return { first: t, last: "" };
  }
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

type ConversationClientInfoPanelProps = {
  conversation: Conversation | undefined;
  clientLookup: ClientLookupResponse | undefined;
  linkedClient: Client | undefined;
  clientLookupLoading: boolean;
  clientInfoOpen: boolean;
  editMode: boolean;
  onClientCreated: (client: Client) => void;
  onClientAssociationCleared: () => void;
  onEditComplete: () => void;
};

export const ConversationClientInfoPanel = observer(
  ({
    conversation,
    clientLookup,
    linkedClient,
    clientLookupLoading,
    clientInfoOpen,
    editMode,
    onClientCreated,
    onClientAssociationCleared,
    onEditComplete,
  }: ConversationClientInfoPanelProps) => {
    const { t } = useTranslation();
    const notification = useNotification();
    const clientsStore = useClientsStore();
    const [form] = Form.useForm<ClientFormValues>();
    const [editForm] = Form.useForm<ClientProfileEditFormValues>();

    const shouldLoadClientDetails =
      clientInfoOpen &&
      linkedClient != null &&
      clientLookup?.associated === true;

    const { client: loadedClient, loading: clientDetailsLoading, reload } =
      useConversationClientDetails(linkedClient?.id, shouldLoadClientDetails);

    const displayClient = loadedClient ?? linkedClient;

    const {
      handleClearSelectedClient,
      handleClientSelect,
      handleCloseLinkSection,
      handleLinkClient,
      handleOpenLinkSection,
      linkLoading,
      linkSectionOpen,
      searchError,
      searchLoading,
      searchRequested,
      searchResults,
      searchValue,
      selectedClient,
      setSearchValue,
    } = useConversationLinkExistingClient({
      conversation,
      onClientLinked: onClientCreated,
    });

    const handleLinkExistingClient = useCallback(async () => {
      const linked = await handleLinkClient();

      if (linked) {
        notification.success({
          title: t("conversation.linkExistingClientSuccess"),
        });
        return true;
      }

      notification.error({
        title: t("conversation.linkExistingClientFailed"),
      });
      return false;
    }, [handleLinkClient, notification, t]);

    const handleClientUpdated = useCallback(
      (client: Client) => {
        onClientCreated(client);
        reload();
      },
      [onClientCreated, reload],
    );

    const handleCurrentConversationUnlinked = useCallback(() => {
      onClientAssociationCleared();
    }, [onClientAssociationCleared]);

    const initialCreateValues = useMemo((): ClientFormValues => {
      if (!conversation) {
        return { first_name: "", last_name: "", phone: "" };
      }
      const { first, last } = splitParticipantName(
        conversation.participant.name,
      );
      return {
        first_name: first,
        last_name: last,
        phone: "",
      };
    }, [conversation]);

    useEffect(() => {
      form.resetFields();
      if (conversation) {
        form.setFieldsValue(initialCreateValues);
      }
    }, [conversation?.id, conversation, form, initialCreateValues]);

    useEffect(() => {
      if (!editMode || !displayClient) {
        return;
      }

      editForm.setFieldsValue({
        first_name: displayClient.firstName,
        last_name: displayClient.lastName,
        phone: normalizeClientPhoneForInput(displayClient.phone),
      });
    }, [displayClient, editForm, editMode]);

    const handleUpdate = useCallback(
      async (values: ClientProfileEditFormValues) => {
        if (!displayClient) {
          return;
        }

        try {
          await clientsStore.updateClient(displayClient.id, {
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone,
            instagramUserIds: displayClient.instagramUserIds ?? [],
            telegramUserIds: displayClient.telegramUserIds ?? [],
          });

          const updated = clientsStore.activeClient;
          if (updated) {
            onClientCreated(updated);
            reload();
          }

          notification.success({ title: t("clients.updateSuccess") });
          onEditComplete();
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(error, t("clients.requestFailed")),
          });
        }
      },
      [
        clientsStore,
        displayClient,
        notification,
        onClientCreated,
        onEditComplete,
        reload,
        t,
      ],
    );

    const handleCreate = useCallback(async () => {
      if (!conversation) {
        return;
      }

      let values: ClientFormValues;
      try {
        values = await form.validateFields();
      } catch {
        return;
      }

      try {
        const participantId = String(conversation.participant.id);

        await clientsStore.createClient({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          instagramUserIds:
            conversation.channel === "instagram" ? [participantId] : [],
          telegramUserIds:
            conversation.channel === "telegram" ? [participantId] : [],
        });
        const created = clientsStore.activeClient;
        if (created) {
          onClientCreated(created);
        }
        notification.success({ title: t("clients.createSuccess") });
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("clients.createFailed")),
        });
      }
    }, [clientsStore, conversation, form, notification, onClientCreated, t]);

    const phoneRules = useMemo(
      () =>
        phoneFieldRules({
          required: false,
          invalidMessage: t("clients.phoneInvalid"),
        }),
      [t],
    );

    const renderParticipantPhoto = (avatarSize = 80) =>
      conversation ? (
        <>
          <S.ParticipantPhoto>
            <Avatar
              size={avatarSize}
              src={conversation.participant.profilePic || undefined}
              alt={
                conversation.participant.name ||
                conversation.participant.username ||
                ""
              }
            >
              {!conversation.participant.profilePic
                ? participantAvatarInitials(conversation, linkedClient)
                : undefined}
            </Avatar>
            {conversation.participant.username ? (
              <S.ParticipantUsername>
                @{conversation.participant.username}
              </S.ParticipantUsername>
            ) : null}
          </S.ParticipantPhoto>
        </>
      ) : null;

    return (
      <S.Root aria-label={t("conversation.clientPanelAria")}>
        <S.PanelScroll>
          {!conversation ? (
            <CenteredSpinner minHeight={200} />
          ) : clientLookupLoading ? (
            <CenteredSpinner minHeight={200} />
          ) : clientLookup && !clientLookup.associated ? (
            <Form
              form={form}
              layout="vertical"
              initialValues={initialCreateValues}
            >
              {renderParticipantPhoto()}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="first_name"
                    label={t("clients.firstName")}
                    rules={[{ required: true, message: t("clients.required") }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="last_name" label={t("clients.lastName")}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="phone"
                label={t("clients.phone")}
                rules={phoneRules}
              >
                <ClientPhoneFormInput
                  autoComplete="tel"
                  placeholder={t("clients.phonePlaceholder")}
                />
              </Form.Item>
              <Button
                type="primary"
                block
                loading={clientsStore.saveLoading}
                onClick={() => void handleCreate()}
              >
                {t("clients.createSubmit")}
              </Button>
              <LinkExistingClientSection
                linkSectionOpen={linkSectionOpen}
                linkLoading={linkLoading}
                searchValue={searchValue}
                searchLoading={searchLoading}
                searchRequested={searchRequested}
                searchError={searchError}
                searchResults={searchResults}
                selectedClient={selectedClient}
                onOpenLinkSection={handleOpenLinkSection}
                onCloseLinkSection={handleCloseLinkSection}
                onSearchChange={setSearchValue}
                onClientSelect={handleClientSelect}
                onClearSelectedClient={handleClearSelectedClient}
                onLinkClient={handleLinkExistingClient}
              />
            </Form>
          ) : displayClient && conversation ? (
            clientDetailsLoading ? (
              <CenteredSpinner minHeight={200} />
            ) : editMode ? (
              <ClientProfileEditForm form={editForm} onFinish={handleUpdate} />
            ) : (
              <ClientProfileDrawerView
                client={displayClient}
                conversation={conversation}
                onClientUpdated={handleClientUpdated}
                onCurrentConversationUnlinked={handleCurrentConversationUnlinked}
              />
            )
          ) : (
            <Text type="secondary">
              {t("conversation.clientRecordMissing")}
            </Text>
          )}
        </S.PanelScroll>
      </S.Root>
    );
  },
);
