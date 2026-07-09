import { Flex, Typography } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

type SectionHeadingProps = {
  icon: ReactNode;
  children: ReactNode;
};

export function SectionHeading({ icon, children }: SectionHeadingProps) {
  return (
    <Flex align="center" gap={8} style={{ minWidth: 0, flex: 1 }}>
      {icon}
      <Text strong ellipsis style={{ minWidth: 0 }}>
        {children}
      </Text>
    </Flex>
  );
}
