import { Badge, Flex, Typography } from "antd";

import { ConversationRowRightColumn } from "./conversation-row-layout";

const { Text } = Typography;

type ConversationRowPreviewProps = {
  messagePreview: string;
  unreadCount: number;
  hasUnreadMessages: boolean;
  badgeColor: string;
};

export const ConversationRowPreview = ({
  messagePreview,
  unreadCount,
  hasUnreadMessages,
  badgeColor,
}: ConversationRowPreviewProps) => (
  <Flex align="center" justify="space-between" gap={8}>
    <Text
      ellipsis
      type="secondary"
      style={{
        flex: 1,
        minWidth: 0,
        fontWeight: hasUnreadMessages ? 600 : 400,
      }}
    >
      {messagePreview}
    </Text>

    <ConversationRowRightColumn align="flex-end">
      {hasUnreadMessages && (
        <Badge
          count={unreadCount}
          overflowCount={99}
          size="medium"
          style={{
            backgroundColor: badgeColor,
            boxShadow: "none",
          }}
        />
      )}
    </ConversationRowRightColumn>
  </Flex>
);
