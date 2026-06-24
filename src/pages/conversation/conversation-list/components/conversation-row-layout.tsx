import { Flex } from "antd";
import type { ReactNode } from "react";

const RIGHT_COLUMN_WIDTH = 44;

type ConversationRowRightColumnProps = {
  children: ReactNode;
  align?: "center" | "flex-end";
};

export const ConversationRowRightColumn = ({
  children,
  align = "center",
}: ConversationRowRightColumnProps) => (
  <Flex
    align={align}
    justify="flex-end"
    style={{
      flex: `0 0 ${RIGHT_COLUMN_WIDTH}px`,
      minWidth: RIGHT_COLUMN_WIDTH,
    }}
  >
    {children}
  </Flex>
);
