import { Card, Col, Flex, Form, Input, InputNumber, Row, Select } from "antd";
import { Typography } from "antd";

const { Title } = Typography;

export type ProductMainInfoSectionProps = {
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
  };
};

export const ProductMainInfoSection = ({
  categoryOptions,
  requiredMessage,
  labels,
}: ProductMainInfoSectionProps) => (
  <Card>
    <Flex vertical gap={24}>
      <Title level={4} style={{ margin: 0 }}>
        Main information about product
      </Title>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={labels.name}
            rules={[
              {
                required: true,
                message: requiredMessage,
              },
            ]}
          >
            <Input placeholder="Type name of product" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="categoryId"
            label={labels.category}
            rules={[
              {
                required: true,
                message: requiredMessage,
              },
            ]}
          >
            <Select
              placeholder="Choose product category"
              options={categoryOptions}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Type description of a product..."
              maxLength={1000}
              showCount
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="price"
            label={labels.price}
            rules={[
              {
                required: true,
                message: requiredMessage,
              },
              {
                type: "number",
                min: 0,
                message: requiredMessage,
              },
            ]}
          >
            <InputNumber min={0} placeholder="0.00" style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="quantity"
            label={labels.quantity}
            rules={[
              {
                required: true,
                message: requiredMessage,
              },
              {
                type: "number",
                min: 0,
                message: requiredMessage,
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Flex>
  </Card>
);
