import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Button, Divider, Flex, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

import { pagesMap } from "@/app/router/pages-map";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import { UserAvatar } from "@/components/user-avatar";
import { ConversationParticipantAvatar } from "@/features/conversations/components/conversation-participant-avatar";
import type { VariantWishlistItem } from "@/features/wishlist/model/wishlist.types";
import { fromNow } from "@/utils/date-time";

import {
  formatWishlistUsername,
  getVariantWishlistClientAvatarSrc,
  getVariantWishlistClientChannel,
  getVariantWishlistClientDisplayName,
} from "./variant-wishlist-clients-drawer.utils";
import styled from "styled-components";

const { Text } = Typography;

type VariantWishlistClientsListItemProps = {
  item: VariantWishlistItem;
  showDivider?: boolean;
};

export const VariantWishlistClientsListItem = ({
  item,
  showDivider = false,
}: VariantWishlistClientsListItemProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { client, conversationId, at } = item;
  const channel = getVariantWishlistClientChannel(client);
  const displayName = getVariantWishlistClientDisplayName(client);
  const username = formatWishlistUsername(channel?.username);
  const addedLabel = at
    ? t("products.variant.wishlistClients.addedAt", { time: fromNow(at) })
    : null;
  const metaParts = [username, addedLabel].filter(Boolean);
  const conversationHref =
    conversationId != null
      ? `${pagesMap.conversations}/${conversationId}`
      : null;
  const channelIcon =
    channel?.source === 2 ? (
      <TelegramLogoIcon size={14} />
    ) : channel?.source === 1 ? (
      <InstagramLogoIcon size={14} />
    ) : null;
  const avatarSrc = getVariantWishlistClientAvatarSrc(client, channel);

  return (
    <StyledContainer>
      <Flex align="center" gap={12} justify="space-between" wrap="wrap">
        <Flex
          align="center"
          gap={12}
          style={{ minWidth: 0, flex: "1 1 200px" }}
        >
          {channel ? (
            <ConversationParticipantAvatar
              participant={{
                id: client.id,
                name: displayName,
                profilePic: avatarSrc,
              }}
              size={40}
              source={channel.source}
            />
          ) : (
            <UserAvatar name={displayName} size={40} src={avatarSrc} />
          )}

          <Flex vertical style={{ minWidth: 0 }}>
            <Text strong ellipsis>
              {displayName}
            </Text>
            {metaParts.length > 0 && (
              <Text type="secondary" ellipsis>
                {metaParts.join(" · ")}
              </Text>
            )}
          </Flex>
        </Flex>

        {conversationHref && (
          <Button
            href={conversationHref}
            icon={channelIcon ?? undefined}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("products.variant.wishlistClients.openDialogue")}
            <ArrowSquareOutIcon size={14} style={{ marginLeft: 6 }} />
          </Button>
        )}
      </Flex>

      {showDivider && <Divider style={{ margin: `${token.marginSM}px 0` }} />}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 2px 6px;
`;
