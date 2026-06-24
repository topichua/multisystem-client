import { UserMinusIcon } from "@phosphor-icons/react";
import { Badge, Flex, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { ConversationGroup } from "@/features/conversation-groups/model/conversation-group.types";
import type { ConversationAssignee } from "@/features/conversations/model/types";

import { ConversationRowRightColumn } from "./conversation-row-layout";

const { Text } = Typography;

type ConversationGroupLabelProps = {
  group: Pick<ConversationGroup, "name" | "color"> | null;
};

type ConversationAssigneeBadgeProps = {
  assignee: ConversationAssignee | null;
  emptyColor: string;
};

type ConversationRowMetaProps = {
  group: Pick<ConversationGroup, "name" | "color"> | null;
  assignee: ConversationAssignee | null;
  emptyAssigneeColor: string;
};

export const ConversationRowMeta = ({
  group,
  assignee,
  emptyAssigneeColor,
}: ConversationRowMetaProps) => (
  <Flex
    align="center"
    justify={group !== null ? "space-between" : "flex-end"}
    gap={8}
  >
    <ConversationGroupLabel group={group} />

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

const ConversationGroupLabel = ({ group }: ConversationGroupLabelProps) => (
  <Flex
    align="center"
    gap={4}
    style={{
      flex: 1,
      minWidth: 0,
    }}
  >
    {group && (
      <>
        <Badge color={group.color} />
        <Text
          ellipsis
          style={{
            fontSize: 12,
            color: group.color,
          }}
        >
          {group.name}
        </Text>
      </>
    )}
  </Flex>
);
