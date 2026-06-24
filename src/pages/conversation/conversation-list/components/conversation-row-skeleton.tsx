import { Flex, Skeleton } from "antd";

import * as S from "../conversation.styled";

export const ConversationRowSkeleton = () => (
  <S.ConversationRow $isSelected={false} $selectionColor="transparent">
    <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
      <Skeleton.Avatar active size={40} />
      <Flex vertical gap={6} style={{ flex: 1 }}>
        <Skeleton.Input
          active
          size="small"
          style={{ width: "min(180px, 55%)", height: 18 }}
        />
        <Skeleton.Input
          active
          size="small"
          style={{ width: "min(260px, 85%)", height: 14 }}
        />
      </Flex>
    </Flex>
  </S.ConversationRow>
);
