import { UserMinusIcon } from "@phosphor-icons/react";
import { Badge, Flex, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type {
  ConversationAssignee,
  ConversationStatus,
} from "@/features/conversations/model/types";

import { ConversationRowRightColumn } from "./conversation-row-layout";

const { Text } = Typography;

type ConversationStatusLabelProps = {
  status: ConversationStatus | null;
};

type ConversationAssigneeBadgeProps = {
  assignee: ConversationAssignee | null;
  emptyColor: string;
};

type ConversationRowMetaProps = {
  status: ConversationStatus | null;
  assignee: ConversationAssignee | null;
  emptyAssigneeColor: string;
};

export const ConversationRowMeta = ({
  status,
  assignee,
  emptyAssigneeColor,
}: ConversationRowMetaProps) => (
  <Flex
    align="center"
    justify={status !== null ? "space-between" : "flex-end"}
    gap={8}
  >
    <ConversationStatusLabel status={status} />

    <ConversationRowRightColumn align="flex-end">
      <ConversationAssigneeBadge
        assignee={assignee}
        emptyColor={emptyAssigneeColor}
      />
    </ConversationRowRightColumn>
  </Flex>
);

const ConversationAssigneeBadge = ({
  assignee,
  emptyColor,
}: ConversationAssigneeBadgeProps) => {
  const { t } = useTranslation();

  if (!assignee) {
    return (
      <Tooltip title={t("conversations.unassignedAssignee")}>
        <span
          role="img"
          aria-label={t("conversations.unassignedAssigneeAria")}
          style={{
            display: "inline-flex",
            color: emptyColor,
          }}
        >
          <UserMinusIcon size={16} />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={assignee.name}>
      <UserAvatar
        size={20}
        name={assignee.name}
        src={assignee.profilePic || undefined}
        style={
          assignee.avatarColor
            ? {
                backgroundColor: assignee.avatarColor,
              }
            : undefined
        }
      />
    </Tooltip>
  );
};

const ConversationStatusLabel = ({ status }: ConversationStatusLabelProps) => (
  <Flex
    align="center"
    gap={4}
    style={{
      flex: 1,
      minWidth: 0,
    }}
  >
    {status && (
      <>
        <Badge color={status.color} />
        <Text
          ellipsis
          style={{
            color: status.color,
            fontSize: 12,
          }}
        >
          {status.name}
        </Text>
      </>
    )}
  </Flex>
);
