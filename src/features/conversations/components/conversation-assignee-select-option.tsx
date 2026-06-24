import { UserMinusIcon } from "@phosphor-icons/react";
import { Space, Typography } from "antd";

import { UserAvatar } from "@/components/user-avatar";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

const { Text } = Typography;

type ConversationAssigneeSelectOptionProps = {
  member?: WorkspaceMember;
  label: string;
};

export const ConversationAssigneeSelectOption = ({
  member,
  label,
}: ConversationAssigneeSelectOptionProps) => {
  if (!member) {
    return (
      <Space size={8} align="center">
        <UserMinusIcon size={18} color="rgba(0,0,0,0.45)" />
        <Text type="secondary">{label}</Text>
      </Space>
    );
  }

  return (
    <Space size={8} align="center">
      <UserAvatar
        size={22}
        name={label}
        src={member.user.avatar_src || undefined}
        style={member.color ? { backgroundColor: member.color } : undefined}
      />
      <span>{label}</span>
    </Space>
  );
};
