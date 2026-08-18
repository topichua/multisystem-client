import { ClockIcon } from "@phosphor-icons/react";
import { Avatar, Tooltip } from "antd";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { UserAvatar } from "@/components/user-avatar";
import type {
  ConversationFollowUp,
  ConversationParticipant,
  ConversationSource,
} from "@/features/conversations/model/types";
import { formatFollowUpSchedule } from "@/utils/date-time";

const InstagramLogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect x={3} y={3} width={18} height={18} rx={5} />
    <circle cx={12} cy={12} r={4} />
    <circle cx={17.5} cy={6.5} r={0.6} fill="currentColor" />
  </svg>
);

const TelegramLogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21.5 4.3 2.8 11.4c-.9.3-.9 1.5.1 1.8l4.7 1.5 1.8 5.4c.2.7 1 .9 1.5.4l2.6-2.5 4.6 3.4c.6.4 1.4.1 1.6-.6l3.2-15c.2-.9-.6-1.6-1.4-1.5Z" />
    <path d="m7.6 14.7 9.6-6.1-7.3 6.9" />
  </svg>
);

const SOURCE_CONFIG: Record<
  ConversationSource,
  {
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    backgroundColor: string;
  }
> = {
  1: {
    Icon: InstagramLogoIcon,
    backgroundColor: "#e54085",
  },
  2: {
    Icon: TelegramLogoIcon,
    backgroundColor: "#229ED9",
  },
};

type ConversationParticipantAvatarProps = {
  participant: ConversationParticipant;
  source: ConversationSource;
  followUp?: ConversationFollowUp | null;
  size?: number;
  badgeSize?: number;
  iconSize?: number;
  className?: string;
  style?: CSSProperties;
};

export const ConversationParticipantAvatar = ({
  participant,
  source,
  followUp = null,
  size = 42,
  badgeSize = 20,
  iconSize = 11,
  className,
  style,
}: ConversationParticipantAvatarProps) => {
  const { t } = useTranslation();
  const sourceConfig = SOURCE_CONFIG[source];
  const SourceIcon = sourceConfig.Icon;
  const followUpLabel = followUp
    ? formatFollowUpSchedule(followUp.scheduledAt)
    : "";
  const followUpTitle =
    followUpLabel !== ""
      ? t("conversations.followUpBadgeTooltip", { when: followUpLabel })
      : t("conversations.followUpBadgeAria");

  return (
    <AvatarWithSource className={className} style={style}>
      <UserAvatar
        size={size}
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

      {followUp != null && (
        <FollowUpBadge>
          <Tooltip title={followUpTitle}>
            <span>
              <Avatar size={badgeSize} aria-label={followUpTitle}>
                <ClockIcon size={iconSize} color="#fff" />
              </Avatar>
            </span>
          </Tooltip>
        </FollowUpBadge>
      )}

      <SourceBadge>
        <Avatar
          size={badgeSize}
          style={{ background: sourceConfig.backgroundColor }}
        >
          <SourceIcon width={iconSize} height={iconSize} color="#fff" />
        </Avatar>
      </SourceBadge>
    </AvatarWithSource>
  );
};

const AvatarWithSource = styled.span`
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
`;

const BadgeRing = styled.span`
  position: absolute;
  right: -5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

const SourceBadge = styled(BadgeRing)`
  bottom: -5px;
  pointer-events: none;
`;

const FollowUpBadge = styled(BadgeRing)`
  top: -5px;

  .ant-avatar {
    background: ${({ theme }) => theme.colors.base.yellow[4]};
  }
`;
