import { Flex, Typography } from "antd";

import { UserAvatar } from "@/components/user-avatar";
import type { InventoryMovementUser } from "@/features/inventory/model/inventory.types";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

const { Text } = Typography;

type InventoryHistoryUserCellProps = {
  user: InventoryMovementUser | null;
  memberByUserId: Map<number, WorkspaceMember>;
  avatarSize?: number;
};

export function InventoryHistoryUserCell({
  user,
  memberByUserId,
  avatarSize = 28,
}: InventoryHistoryUserCellProps) {
  if (!user) {
    return <Text type="secondary">—</Text>;
  }

  const member = memberByUserId.get(user.id);
  const name = member
    ? getWorkspaceMemberName(member)
    : user.name?.trim() || "—";
  const avatarSrc = member?.user.avatar_src ?? undefined;

  return (
    <Flex align="center" gap={8} style={{ minWidth: 0 }}>
      <UserAvatar
        size={avatarSize}
        name={name}
        src={avatarSrc}
        style={
          member?.color
            ? {
                backgroundColor: member.color,
              }
            : undefined
        }
      />
      <Text ellipsis style={{ minWidth: 0 }}>
        {name}
      </Text>
    </Flex>
  );
}
