import { XIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import { clientsApi } from "@/features/clients/api/clients-api";
import type { ClientLinkProvider } from "@/features/clients/model/client.types";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "../conversation-client-info-panel.styled";
import {
  getClientSocialLinks,
  isCurrentConversationLink,
} from "../utils/client-social-links.utils";

const { Text } = Typography;

type ClientContactsSectionProps = {
  client: Client;
  conversation: Conversation;
  onClientUpdated: (client: Client) => void;
  onCurrentConversationUnlinked: () => void;
};

const renderProviderIcon = (provider: ClientLinkProvider) => {
  if (provider === "instagram") {
    return <InstagramLogoIcon size={20} />;
  }

  return <TelegramLogoIcon size={20} />;
};

export function ClientContactsSection({
  client,
  conversation,
  onClientUpdated,
  onCurrentConversationUnlinked,
}: ClientContactsSectionProps) {
  const { t } = useTranslation();
  const notification = useNotification();
  const [unlinkingKey, setUnlinkingKey] = useState<string | null>(null);

  const socialLinks = useMemo(
    () => getClientSocialLinks(client, conversation),
    [client, conversation],
  );

  const handleUnlink = useCallback(
    async (provider: ClientLinkProvider, externalId: string) => {
      const unlinkKey = `${provider}:${externalId}`;
      setUnlinkingKey(unlinkKey);

      try {
        await clientsApi.deleteLink(client.id, { provider, externalId });

        const updatedClient = await clientsApi.getById(client.id);
        const remainingLinks = getClientSocialLinks(
          updatedClient,
          conversation,
        );
        const removedCurrentConversation = isCurrentConversationLink(
          { provider, externalId },
          conversation,
        );

        if (removedCurrentConversation || remainingLinks.length === 0) {
          onCurrentConversationUnlinked();
          return;
        }

        onClientUpdated(updatedClient);
        notification.success({
          title: t("conversation.clientProfile.unlinkSuccess"),
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("conversation.clientProfile.unlinkFailed"),
          ),
        });
      } finally {
        setUnlinkingKey(null);
      }
    },
    [
      client.id,
      conversation,
      notification,
      onClientUpdated,
      onCurrentConversationUnlinked,
      t,
    ],
  );

  return (
    <S.Section>
      <S.SectionLabel>
        {t("conversation.clientProfile.contacts")}
      </S.SectionLabel>

      <Flex justify="space-between" align="center" gap={12}>
        <Text type="secondary">{t("clients.phone")}</Text>
        <Text strong>{client.phone?.trim() || "—"}</Text>
      </Flex>

      {socialLinks.length > 0 && (
        <S.SocialLinksList>
          {socialLinks.map((link) => {
            const unlinkKey = `${link.provider}:${link.externalId}`;

            return (
              <S.SocialLinkCard key={unlinkKey}>
                <S.SocialLinkMain>
                  {renderProviderIcon(link.provider)}
                  <Text ellipsis>{link.label}</Text>
                </S.SocialLinkMain>

                <Button
                  type="text"
                  size="small"
                  aria-label={t("conversation.clientProfile.unlinkAria")}
                  loading={unlinkingKey === unlinkKey}
                  icon={<XIcon size={14} />}
                  onClick={() =>
                    void handleUnlink(link.provider, link.externalId)
                  }
                />
              </S.SocialLinkCard>
            );
          })}
        </S.SocialLinksList>
      )}
    </S.Section>
  );
}
