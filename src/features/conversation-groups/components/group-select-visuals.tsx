import { Space } from "antd";
import type { TagProps } from "antd";
import type { CSSProperties } from "react";

import { GROUP_TAG_ON_COLOR } from "@/features/conversation-groups/group-select-options";
import { Tag } from "@/components/tag/tag";

type SwatchProps = {
  color: string;
  size?: number;
  shape?: "square" | "circle";
};

export const GroupColorSwatch = ({
  color,
  size = 10,
  shape = "square",
}: SwatchProps) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: shape === "circle" ? "50%" : size > 12 ? 4 : 2,
      background: color,
      border: "1px solid rgba(0,0,0,0.12)",
      flexShrink: 0,
    }}
  />
);

type ColoredNameTagProps = {
  name: string;
  color: string;
  style?: CSSProperties;
  closable?: boolean;
  onClose?: TagProps["onClose"];
};

export const GroupColoredNameTag = ({
  name,
  color,
  style,
  closable,
  onClose,
}: ColoredNameTagProps) => (
  <Tag
    variant="solid"
    closable={closable}
    onClose={onClose}
    color={color}
    style={{
      margin: 0,
      background: color,
      color: GROUP_TAG_ON_COLOR,
      ...style,
    }}
  >
    {name}
  </Tag>
);

export const GroupOptionWithSwatch = ({
  label,
  color,
  showPlainLabels = false,
}: {
  label: string;
  color: string;
  showPlainLabels?: boolean;
}) => (
  <Space size={8} align="center">
    <GroupColorSwatch color={color} />
    {showPlainLabels ? (
      label
    ) : (
      <GroupColoredNameTag name={label} color={color} />
    )}
  </Space>
);
