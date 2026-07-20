import { Descriptions } from "antd";
import type { DescriptionsProps } from "antd";

import type { InfoItem } from "../order-details-content.types";

type InfoListProps = {
  items: InfoItem[];
};

export const InfoList = ({ items }: InfoListProps) => {
  const descriptionItems: DescriptionsProps["items"] = items.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.value,
  }));

  return <Descriptions column={1} size="small" items={descriptionItems} />;
};
