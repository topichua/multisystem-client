import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import type { Conversation } from "@/features/conversations/model/types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

import * as S from "../conversation-client-info-panel.styled";

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
    <S.ProfileHeader>
      <UserAvatar size={72} name={displayName} src={avatarSrc} />
      <S.ProfileName>{displayName}</S.ProfileName>
    </S.ProfileHeader>
  );
}
