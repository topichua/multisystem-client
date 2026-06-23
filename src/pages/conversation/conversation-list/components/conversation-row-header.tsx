import { Flex, Typography } from "antd";

import { ConversationRowRightColumn } from "./conversation-row-layout";

const { Text } = Typography;

type ConversationRowHeaderProps = {
  participantName: string;
  timestamp: string;
  hasUnreadMessages: boolean;
};

export const ConversationRowHeader = ({
  participantName,
  timestamp,
  hasUnreadMessages,
}: ConversationRowHeaderProps) => (
  <Flex align="center" justify="space-between" gap={8}>
    <Text
      ellipsis
      strong={hasUnreadMessages}
      style={{
        flex: 1,
        minWidth: 0,
        fontWeight: hasUnreadMessages ? 700 : 500,
      }}
    >
      {participantName}
    </Text>

    <ConversationRowRightColumn>
      <Text
        type="secondary"
        style={{
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        {timestamp}
      </Text>
    </ConversationRowRightColumn>
  </Flex>
);
