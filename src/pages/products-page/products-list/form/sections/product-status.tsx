import { Card, Flex, Form, Select, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

type StatusOption = {
  value: string;
  label: string;
};

export type ProductStatusProps = {
  requiredMessage: string;
  statusLabel: string;
};

export const ProductStatus = ({
  requiredMessage,
  statusLabel,
}: ProductStatusProps) => {
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
      <Flex vertical gap={16}>
        <Title level={4} style={{ margin: 0 }}>
          {t("products.publication.title")}
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
          <Select options={statusOptions} />
        </Form.Item>

        <Text type="secondary">{t("products.publication.draftHint")}</Text>
      </Flex>
    </Card>
  );
};
