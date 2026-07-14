import { Flex, Typography } from "antd";

const { Title, Text } = Typography;

type SettingsSectionHeaderProps = {
  title: string;
  description: string;
};

export function SettingsSectionHeader({
  title,
  description,
}: SettingsSectionHeaderProps) {
  return (
    <Flex vertical gap={4} style={{ marginBottom: 16 }}>
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Text type="secondary">{description}</Text>
    </Flex>
  );
}
