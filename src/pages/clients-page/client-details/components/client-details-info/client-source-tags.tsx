import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { Typography, theme } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { pagesMap } from "@/app/router/pages-map";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import type {
  Client,
  ClientLinkProvider,
} from "@/features/clients/model/client.types";
import { getClientSocialLinks } from "@/pages/conversation/conversation-details/components/conversation-client-info-panel/utils/client-social-links.utils";

import { sourceTagsStyle } from "./client-details-info.shared";

const { Text } = Typography;

type ClientSourceTagsProps = {
  client: Client;
};

const SocialLinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 320px;
`;

const SocialLinkCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 8px 10px 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.functional.background.natural};
  color: inherit;
  text-decoration: none;
`;

const SocialLinkCardLink = styled(SocialLinkCard).attrs({ as: "a" })`
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.elevated};
  }
`;

const SocialLinkMain = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

function renderProviderIcon(provider: ClientLinkProvider) {
  if (provider === "instagram") {
    return <InstagramLogoIcon size={22} />;
  }

  return <TelegramLogoIcon size={22} />;
}

export function ClientSourceTags({ client }: ClientSourceTagsProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const socialLinks = useMemo(() => getClientSocialLinks(client), [client]);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <SocialLinksList style={sourceTagsStyle}>
      {socialLinks.map((link) => {
        const conversationHref =
          link.conversationId != null
            ? `${pagesMap.conversations}/${link.conversationId}`
            : null;

        const content = (
          <>
            <SocialLinkMain>
              {renderProviderIcon(link.provider)}
              <Text ellipsis>{link.label}</Text>
            </SocialLinkMain>

            {conversationHref ? (
              <ArrowUpRightIcon
                size={16}
                color={token.colorTextQuaternary}
                aria-hidden
              />
            ) : null}
          </>
        );

        if (conversationHref) {
          return (
            <SocialLinkCardLink
              key={`${link.provider}:${link.externalId}`}
              href={conversationHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("orders.details.openClientChat")}
              data-qa={`clients-detail-chat-${link.provider}`}
            >
              {content}
            </SocialLinkCardLink>
          );
        }

        return (
          <SocialLinkCard key={`${link.provider}:${link.externalId}`}>
            {content}
          </SocialLinkCard>
        );
      })}
    </SocialLinksList>
  );
}
