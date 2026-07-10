import { Flex, Typography } from "antd";

import { UserAvatar } from "@/components/user-avatar";
import type { OrderListItem } from "@/features/orders/model/order.types";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";

import { formatOrderCreatedByName } from "./order-list-display.utils";

const { Text } = Typography;

type OrderListManagerCellProps = {
  order: OrderListItem;
  memberByUserId: Map<number, WorkspaceMember>;
};

export function OrderListManagerCell({
  order,
  memberByUserId,
}: OrderListManagerCellProps) {
  const createdBy = order.createdBy;

  if (!createdBy) {
    return <Text type="secondary">—</Text>;
  }

  const member = memberByUserId.get(createdBy.id);
  const name = formatOrderCreatedByName(createdBy);
  const avatarSrc =
    member?.user.avatar_src ?? createdBy.avatar ?? undefined;

  return (
    <Flex align="center" gap={8} style={{ minWidth: 0 }}>
      <UserAvatar
        size={24}
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
