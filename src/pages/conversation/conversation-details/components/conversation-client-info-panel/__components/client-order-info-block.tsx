import { SparkleIcon } from "@phosphor-icons/react";
import { Button, Descriptions, Flex, Space, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";
import {
  formatClientDate,
  formatClientDisplayName,
} from "@/pages/clients-page/clients-list/client-display.utils";
import { formatDateTime } from "@/utils/date-time";

const { Text, Title } = Typography;

type ClientOrdersInfoBlockProps = {
  linkedClient: Client;
  conversation: Conversation;
};

function formatSocialHandle(username: string | undefined): string | null {
  const trimmed = username?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export const ClientOrdersInfoBlock = ({
  linkedClient,
  conversation,
}: ClientOrdersInfoBlockProps) => {
  const { t } = useTranslation();
  const displayName = formatClientDisplayName(linkedClient);
  const avatarSrc =
    linkedClient.avatar_src ?? conversation.participant.profilePic ?? undefined;
  const participantHandle = formatSocialHandle(
    conversation.participant.username,
  );

  const contactItems = useMemo((): DescriptionsProps["items"] => {
    const items: DescriptionsProps["items"] = [
      {
        key: "phone",
        label: t("clients.phone"),
        children: linkedClient.phone?.trim() || "—",
      },
    ];

    if (conversation.channel === "instagram") {
      items.push({
        key: "instagram",
        label: t("clients.source.instagram"),
        children: participantHandle ?? linkedClient.instagramUserIds[0] ?? "—",
      });
    }

    if (conversation.channel === "telegram") {
      items.push({
        key: "telegram",
        label: t("clients.source.telegram"),
        children:
          participantHandle ??
          linkedClient.telegramUserIds[0] ??
          String(conversation.participant.id),
      });
    }

    items.push(
      {
        key: "firstContact",
        label: t("conversation.clientProfile.firstContact"),
        children: formatClientDate(linkedClient.createdAt),
      },
      {
        key: "lastActivity",
        label: t("conversation.clientProfile.lastActivity"),
        children: formatDateTime(conversation.instUpdatedAt) || "—",
      },
    );

    return items;
  }, [conversation, linkedClient, participantHandle, t]);

  return (
    <Flex vertical gap={16}>
      <Flex align="flex-start" gap={12}>
        <UserAvatar size={64} name={displayName} src={avatarSrc} />
        <Flex vertical gap={4} style={{ minWidth: 0 }}>
          <Title level={4} style={{ margin: 0 }}>
            {displayName}
          </Title>
          {conversation.channel === "instagram" && participantHandle ? (
            <Space size={6} align="center">
              <InstagramLogoIcon size={16} />
              <Text type="secondary">{participantHandle}</Text>
            </Space>
          ) : null}
          {conversation.channel === "telegram" && participantHandle ? (
            <Text type="secondary">{participantHandle}</Text>
          ) : null}
        </Flex>
      </Flex>

      <Button block variant="outlined" icon={<SparkleIcon size={16} />}>
        {t("conversation.clientProfile.aiAnalysis")}
      </Button>

      <Flex vertical gap={8}>
        <Text
          type="secondary"
          style={{ fontSize: 12, letterSpacing: "0.04em" }}
        >
          {t("clients.table.contacts").toUpperCase()}
        </Text>
        <Descriptions size="small" column={1} items={contactItems} />
      </Flex>
    </Flex>
  );
};
