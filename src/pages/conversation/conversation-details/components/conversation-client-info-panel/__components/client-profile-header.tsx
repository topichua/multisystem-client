import { Flex, Typography } from "antd";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

const { Title } = Typography;

type ClientProfileHeaderProps = {
  client: Client;
  conversation: Conversation;
};

export function ClientProfileHeader({
  client,
  conversation,
}: ClientProfileHeaderProps) {
  const displayName = formatClientDisplayName(client);
  const avatarSrc =
    client.avatar_src ?? conversation.participant.profilePic ?? undefined;

  return (
    <Flex align="center" gap={12}>
      <UserAvatar size={40} name={displayName} src={avatarSrc} />
      <Title level={5} style={{ margin: 0 }}>
        {displayName}
      </Title>
    </Flex>
  );
}
