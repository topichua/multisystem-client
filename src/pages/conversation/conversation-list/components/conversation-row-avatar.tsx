import { InstagramLogoIcon, TelegramLogoIcon } from "@phosphor-icons/react";
import { Avatar } from "antd";

import { UserAvatar } from "@/components/user-avatar";
import type {
  Conversation,
  ConversationParticipant,
} from "@/features/conversations/model/types";

import * as S from "../conversation.styled";

const CHANNEL_CONFIG = {
  instagram: {
    Icon: InstagramLogoIcon,
    backgroundColor: "#E4405F",
  },
  telegram: {
    Icon: TelegramLogoIcon,
    backgroundColor: "#229ED9",
  },
} as const;

type ConversationRowAvatarProps = {
  participant: ConversationParticipant;
  channel: Conversation["channel"];
};

export const ConversationRowAvatar = ({
  participant,
  channel,
}: ConversationRowAvatarProps) => {
  const channelConfig = CHANNEL_CONFIG[channel];
  const ChannelIcon = channelConfig.Icon;

  return (
    <S.AvatarWithChannel>
      <UserAvatar
        size={42}
        name={participant.name}
        src={participant.profilePic || undefined}
        style={
          participant.avatarColor
            ? {
                backgroundColor: participant.avatarColor,
              }
            : undefined
        }
      />

      <S.ChannelBadge>
        <Avatar
          size={22}
          style={{ backgroundColor: channelConfig.backgroundColor }}
        >
          <ChannelIcon size={12} weight="fill" color="#fff" />
        </Avatar>
      </S.ChannelBadge>
    </S.AvatarWithChannel>
  );
};
