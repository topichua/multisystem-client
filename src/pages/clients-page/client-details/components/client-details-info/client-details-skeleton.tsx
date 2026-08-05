import { Flex, Skeleton } from "antd";

import { growStyle } from "./client-details-info.shared";

export function ClientDetailsSkeleton() {
  return (
    <Flex align="center" gap={16} style={growStyle}>
      <Skeleton.Avatar active size={64} />
      <Flex vertical gap={2} style={growStyle}>
        <Skeleton.Input active size="small" style={{ width: 220 }} />
        <Skeleton.Input active size="small" style={{ width: 280 }} />
      </Flex>
    </Flex>
  );
}
