import { LockIcon } from "@phosphor-icons/react";
import { Flex, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

const { Text } = Typography;

type ClientProfileHeaderProps = {
  client: Client;
  conversation: Conversation;
};

export function ClientProfileHeader({
  client,
  conversation,
}: ClientProfileHeaderProps) {
  const { t } = useTranslation();
  const displayName = formatClientDisplayName(client);
  const avatarSrc =
    client.avatar_src ?? conversation.participant.profilePic ?? undefined;

  return (
    <Flex align="center" gap={10} style={{ minWidth: 0, maxWidth: "100%" }}>
      <UserAvatar
        size={40}
        name={displayName}
        src={avatarSrc}
        style={{ flexShrink: 0 }}
      />
      <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
        <Text
          strong
          ellipsis={{ tooltip: displayName }}
          style={{ margin: 0, fontSize: 16, lineHeight: 1.3 }}
        >
          {displayName}
        </Text>
        {client.blocked && (
          <Tag
            color="red"
            icon={<LockIcon size={12} weight="bold" />}
            style={{ marginInlineEnd: 0, width: "fit-content" }}
          >
            {t("clients.blockedBadge")}
          </Tag>
        )}
      </Flex>
    </Flex>
  );
}
