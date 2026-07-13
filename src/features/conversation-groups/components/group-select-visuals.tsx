import type { Icon } from "@phosphor-icons/react";
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

export const GroupIconMark = ({
  icon: IconComponent,
  size = 14,
}: {
  icon: Icon;
  size?: number;
}) => (
  <span
    aria-hidden="true"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "currentColor",
      flexShrink: 0,
    }}
  >
    <IconComponent size={size} />
  </span>
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
  icon,
  showPlainLabels = false,
}: {
  label: string;
  color?: string;
  icon?: Icon;
  showPlainLabels?: boolean;
}) => {
  const showPlainText = showPlainLabels || Boolean(icon);

  return (
    <Space size={8} align="center">
      {icon ? (
        <GroupIconMark icon={icon} />
      ) : (
        <GroupColorSwatch color={color ?? "transparent"} />
      )}
      {showPlainText ? (
        label
      ) : (
        <GroupColoredNameTag name={label} color={color ?? "transparent"} />
      )}
    </Space>
  );
};

export const GroupOptionDivider = () => (
  <span
    aria-hidden="true"
    style={{
      display: "block",
      height: 1,
      minHeight: 1,
      background: "rgba(5, 5, 5, 0.06)",
    }}
  />
);
