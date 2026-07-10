import { Col, Flex, Form, InputNumber, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export type ProductDeliverySectionProps = {
  isMobile?: boolean;
};

export const ProductDeliverySection = ({
  isMobile = false,
}: ProductDeliverySectionProps) => {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={12}>
      <Title level={5} style={{ margin: 0 }}>
        {t("products.delivery.title")}
      </Title>

      <Text type="secondary">{t("products.delivery.description")}</Text>

      <Row gutter={isMobile ? [0, 0] : [24, 0]}>
        <Col span={isMobile ? 24 : 6}>
          <Form.Item name="weightGrams" label={t("products.delivery.weight")}>
            <InputNumber
              min={0}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
              addonAfter={t("products.delivery.unitGrams")}
            />
          </Form.Item>
        </Col>

        <Col span={isMobile ? 24 : 6}>
          <Form.Item name="lengthCm" label={t("products.delivery.length")}>
            <InputNumber
              min={0}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
              addonAfter={t("products.delivery.unitCm")}
            />
          </Form.Item>
        </Col>

        <Col span={isMobile ? 24 : 6}>
          <Form.Item name="widthCm" label={t("products.delivery.width")}>
            <InputNumber
              min={0}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
              addonAfter={t("products.delivery.unitCm")}
            />
          </Form.Item>
        </Col>

        <Col span={isMobile ? 24 : 6}>
          <Form.Item name="heightCm" label={t("products.delivery.height")}>
            <InputNumber
              min={0}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
              addonAfter={t("products.delivery.unitCm")}
            />
          </Form.Item>
        </Col>
      </Row>
    </Flex>
  );
};
