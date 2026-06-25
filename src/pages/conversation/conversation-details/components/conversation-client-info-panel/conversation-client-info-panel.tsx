import {
  Avatar,
  Button,
  Flex,
  Form,
  Input,
  Typography,
  message,
} from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type {
  Client,
  ClientInstagramAssociationResponse,
} from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { Conversation } from "@/features/conversations/model/types";
import { phoneFieldRules } from "@/utils/phone-input";

import { ClientOrderDrawer } from "./__components/client-order-drawers";
import { ClientOrdersInfoBlock } from "./__components/client-order-info-block";
import { ClientOrdersSummary } from "./__components/client-order-summary";
import { ClientOrdersList } from "./__components/client-orders-list";
import * as S from "./conversation-client-info-panel.styled";

const { Text } = Typography;

type ClientFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  delivery_info?: string;
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
  instagramAssociation: ClientInstagramAssociationResponse | undefined;
  linkedClient: Client | undefined;
  linkedClientLoading: boolean;
  onClientCreated: (client: Client) => void;
};

export const ConversationClientInfoPanel = observer(
  ({
    conversation,
    instagramAssociation,
    linkedClient,
    linkedClientLoading,
    onClientCreated,
  }: ConversationClientInfoPanelProps) => {
    const { t } = useTranslation();
    const [messageApi, contextHolder] = message.useMessage();
    const clientsStore = useClientsStore();
    const ordersStore = useOrdersStore();
    const [form] = Form.useForm<ClientFormValues>();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createOrderDrawerOpen, setCreateOrderDrawerOpen] = useState(false);

    const showCreateOrderDrawer = () => {
      setCreateOrderDrawerOpen(true);
    };

    const closeCreateOrderDrawer = () => {
      setCreateOrderDrawerOpen(false);
    };

    useEffect(() => {
      setShowCreateForm(false);
      form.resetFields();
    }, [conversation?.id, form]);

    const initialCreateValues = useMemo((): ClientFormValues => {
      if (!conversation) {
        return { first_name: "", last_name: "", phone: "", delivery_info: "" };
      }
      const { first, last } = splitParticipantName(
        conversation.participant.name,
      );
      return {
        first_name: first,
        last_name: last,
        phone: "",
        delivery_info: "",
      };
    }, [conversation]);

    useEffect(() => {
      if (showCreateForm && conversation) {
        form.setFieldsValue(initialCreateValues);
      }
    }, [conversation, form, initialCreateValues, showCreateForm]);

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
        await clientsStore.createClient({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          delivery_info: values.delivery_info ?? "",
          instagramId: String(conversation.participant.id),
        });
        const created = clientsStore.activeClient;
        if (created) {
          onClientCreated(created);
        }
        setShowCreateForm(false);
        form.resetFields();
        messageApi.success(t("clients.createSuccess"));
      } catch (e) {
        messageApi.error(getApiErrorMessage(e, t("clients.createFailed")));
      }
    }, [clientsStore, conversation, form, messageApi, onClientCreated, t]);

    const associationPending = instagramAssociation === undefined;

    const phoneRules = useMemo(
      () =>
        phoneFieldRules({
          requiredMessage: t("clients.required"),
          invalidMessage: t("clients.phoneInvalid"),
        }),
      [t],
    );

    const renderParticipantPhoto = (flush?: boolean, avatarSize = 80) =>
      conversation ? (
        <S.ParticipantPhoto $flush={flush}>
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
        </S.ParticipantPhoto>
      ) : null;

    return (
      <S.Root aria-label={t("conversation.clientPanelAria")}>
        {contextHolder}
        {instagramAssociation && !instagramAssociation.associated ? (
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
            {t("conversation.clientNotLinked")}
          </Text>
        ) : null}
        <S.PanelScroll>
          {!conversation ? (
            <CenteredSpinner minHeight={200} />
          ) : associationPending ? (
            <CenteredSpinner minHeight={200} />
          ) : instagramAssociation && !instagramAssociation.associated ? (
            showCreateForm ? (
              <Form
                form={form}
                layout="vertical"
                initialValues={initialCreateValues}
              >
                {renderParticipantPhoto()}
                <Form.Item
                  name="first_name"
                  label={t("clients.firstName")}
                  rules={[{ required: true, message: t("clients.required") }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="last_name"
                  label={t("clients.lastName")}
                  rules={[{ required: true, message: t("clients.required") }]}
                >
                  <Input />
                </Form.Item>
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
                <Form.Item
                  name="delivery_info"
                  label={t("clients.deliveryInfo")}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Flex vertical gap={8}>
                  <Button
                    type="primary"
                    block
                    loading={clientsStore.saveLoading}
                    onClick={() => void handleCreate()}
                  >
                    {t("clients.createSubmit")}
                  </Button>
                  <Button
                    block
                    onClick={() => {
                      form.resetFields();
                      setShowCreateForm(false);
                    }}
                  >
                    {t("conversation.backFromCreate")}
                  </Button>
                </Flex>
              </Form>
            ) : (
              <S.EmptyCenter>
                <Flex
                  vertical
                  align="center"
                  gap={12}
                  style={{ width: "100%", maxWidth: 300 }}
                >
                  {renderParticipantPhoto(true)}
                  <Text
                    type="secondary"
                    style={{ textAlign: "center", lineHeight: 1.45 }}
                    data-qa="layout-conversation-details-client-not-linked-hint"
                  >
                    {t("conversation.clientNotLinked")}
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setShowCreateForm(true)}
                  >
                    {t("conversation.addClient")}
                  </Button>
                </Flex>
              </S.EmptyCenter>
            )
          ) : linkedClientLoading ? (
            <CenteredSpinner minHeight={200} />
          ) : linkedClient ? (
            <Flex gap={24} vertical>
              <ClientOrdersInfoBlock
                linkedClient={linkedClient}
                renderParticipantPhoto={renderParticipantPhoto}
              />
              <ClientOrdersSummary clientId={linkedClient.id} />
              <ClientOrdersList clientId={linkedClient.id} />
              <Button type="primary" block onClick={showCreateOrderDrawer}>
                {t("conversation.clientOrders.createOrder")}
              </Button>
            </Flex>
          ) : (
            <Text type="secondary">
              {t("conversation.clientRecordMissing")}
            </Text>
          )}

          {linkedClient && conversation ? (
            <ClientOrderDrawer
              linkedClient={linkedClient}
              conversationId={conversation.id}
              onClose={closeCreateOrderDrawer}
              onOpen={createOrderDrawerOpen}
              clientPic={conversation.participant.profilePic ?? undefined}
              onOrderCreated={() => {
                void ordersStore.loadOrders({ silent: true });
                if (ordersStore.clientStatsClientId != null) {
                  void ordersStore.loadClientStats(
                    ordersStore.clientStatsClientId,
                  );
                }
                if (ordersStore.clientOrdersClientId != null) {
                  void ordersStore.loadClientOrders(
                    ordersStore.clientOrdersClientId,
                  );
                }
              }}
            />
          ) : null}
        </S.PanelScroll>
      </S.Root>
    );
  },
);
