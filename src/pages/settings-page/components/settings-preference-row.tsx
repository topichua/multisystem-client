import { Flex, Typography, theme } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

type SettingsPreferenceRowProps = {
  icon: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  stackControl?: boolean;
};

export function SettingsPreferenceRow({
  icon,
  title,
  description,
  control,
  stackControl = false,
}: SettingsPreferenceRowProps) {
  const { token } = theme.useToken();

  const iconBox = (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 40,
        height: 40,
        borderRadius: token.borderRadiusLG,
        background: token.colorPrimaryBg,
        color: token.colorPrimary,
        flexShrink: 0,
      }}
    >
      {icon}
    </Flex>
  );

  const copy = (title || description) && (
    <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
      {title && <Text strong>{title}</Text>}
      {description && (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {description}
        </Text>
      )}
    </Flex>
  );

  if (stackControl) {
    return (
      <Flex vertical gap={12}>
        <Flex align="flex-start" gap={12}>
          {iconBox}
          {copy}
        </Flex>
        {control}
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="space-between" gap={16}>
      <Flex align="flex-start" gap={12} style={{ minWidth: 0, flex: 1 }}>
        {iconBox}
        {copy}
      </Flex>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </Flex>
  );
}
