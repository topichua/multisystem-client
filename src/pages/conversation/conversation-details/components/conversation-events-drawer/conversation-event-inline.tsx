import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

import { formatDateTime } from "@/utils/date-time";

const { Text } = Typography;

type ConversationEventInlineProps = {
  children: ReactNode;
  createdAt: string;
  actorName?: string;
};

export function ConversationEventInline({
  children,
  createdAt,
  actorName,
}: ConversationEventInlineProps) {
  const meta = [actorName, formatDateTime(createdAt)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Flex vertical gap={2} style={{ minWidth: 0, paddingTop: 2 }}>
      <Text>{children}</Text>
      {meta.length > 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {meta}
        </Text>
      )}
    </Flex>
  );
}
