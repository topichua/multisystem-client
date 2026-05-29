import { Card, Flex, Form, Select, Typography } from "antd";

const { Title, Text } = Typography;

type StatusOption = {
  value: string;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export type ProductPublicationSidebarProps = {
  requiredMessage: string;
  statusLabel: string;
};

export const ProductPublicationSidebar = ({
  requiredMessage,
  statusLabel,
}: ProductPublicationSidebarProps) => (
  <Card>
    <Flex vertical gap={16}>
      <Title level={4} style={{ margin: 0 }}>
        Publication parameters
      </Title>

      <Form.Item
        name="status"
        label={statusLabel}
        rules={[
          {
            required: true,
            message: requiredMessage,
          },
        ]}
        style={{ marginBottom: 0 }}
      >
        <Select options={STATUS_OPTIONS} />
      </Form.Item>

      <Text type="secondary">
        Draft — product will not be visible to customers
      </Text>
    </Flex>
  </Card>
);
