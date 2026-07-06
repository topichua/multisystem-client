import { Card, Col, Flex, Form, Input, InputNumber, Row, Select } from "antd";
import { Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ProductDeliverySection } from "./product-delivery-section";

const { Title, Text } = Typography;

type StatusOption = {
  value: string;
  label: string;
};

export type ProductMainInfoSectionProps = {
  categoryOptions: Array<{ value: number; label: string }>;
  requiredMessage: string;
  labels: {
    name: string;
    category: string;
    price: string;
    quantity: string;
    status: string;
  };
  showQuantityField: boolean;
  showStatusField?: boolean;
  isMobile?: boolean;
};

export const ProductMainInfoSection = ({
  categoryOptions,
  requiredMessage,
  labels,
  showQuantityField,
  showStatusField = true,
  isMobile = false,
}: ProductMainInfoSectionProps) => {
  const { t } = useTranslation();
  const statusOptions: StatusOption[] = useMemo(
    () => [
      { value: "draft", label: t("products.status.draft") },
      { value: "active", label: t("products.status.active") },
      { value: "archived", label: t("products.status.archived") },
    ],
    [t],
  );

  return (
    <Card>
      <Flex vertical gap={12}>
        <Title level={5} style={{ margin: 0 }}>
          {t("products.form.mainInfoTitle")}
        </Title>

        <Row gutter={isMobile ? [0, 0] : [24, 0]}>
          <Col span={isMobile ? 24 : 12}>
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
              <Input placeholder={t("products.form.namePlaceholder")} />
            </Form.Item>
          </Col>

          <Col span={isMobile ? 24 : 12}>
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
                placeholder={t("products.form.categoryPlaceholder")}
                options={categoryOptions}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("products.form.description")}
              name="description"
            >
              <Input.TextArea
                placeholder={t("products.form.descriptionPlaceholder")}
                maxLength={1000}
                showCount
                autoSize={{ minRows: 2, maxRows: 10 }}
              />
            </Form.Item>
          </Col>

          <Col span={isMobile ? 24 : 12}>
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
              <InputNumber
                min={0}
                placeholder="0.00"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          {showQuantityField && (
            <Col span={isMobile ? 24 : 12}>
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
          )}
        </Row>

        <ProductDeliverySection isMobile={isMobile} />

        {showStatusField ? (
          <Flex vertical gap={16}>
            <Title level={5} style={{ margin: 0 }}>
              {t("products.publication.title")}
            </Title>

            <Form.Item
              name="status"
              label={labels.status}
              rules={[
                {
                  required: true,
                  message: requiredMessage,
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select options={statusOptions} />
            </Form.Item>

            <Text type="secondary">{t("products.publication.draftHint")}</Text>
          </Flex>
        ) : (
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
        )}
      </Flex>
    </Card>
  );
};
