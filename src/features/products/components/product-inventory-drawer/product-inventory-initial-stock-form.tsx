import { CheckIcon, InfoIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Flex,
  Form,
  InputNumber,
  Typography,
  theme,
} from "antd";
import { useTranslation } from "react-i18next";

import type { InitialStockValues } from "@/features/inventory/model/inventory.types";

const { Text } = Typography;

type InitialStockFormFields = {
  quantity?: number;
  purchasePrice?: number;
};

type ProductInventoryInitialStockFormProps = {
  currency: string;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: InitialStockValues) => Promise<void>;
};

export const ProductInventoryInitialStockForm = ({
  currency,
  submitting,
  error,
  onCancel,
  onSubmit,
}: ProductInventoryInitialStockFormProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<InitialStockFormFields>();

  const handleFinish = (values: InitialStockFormFields) => {
    void onSubmit({
      quantity: Number(values.quantity ?? 0),
      purchasePrice: Number(values.purchasePrice ?? 0),
      comment: "",
    })
      .then(() => {
        form.resetFields();
      })
      .catch(() => undefined);
  };

  return (
    <Form<InitialStockFormFields>
      form={form}
      layout="vertical"
      requiredMark
      onFinish={handleFinish}
    >
      <Flex
        vertical
        gap={12}
        style={{
          padding: 12,
        }}
      >
        <Flex align="center" gap={8}>
          <InfoIcon size={14} color={token.colorPrimary} />
          <Text type="secondary">
            {t("products.inventoryDrawer.initialStock.hint")}
          </Text>
        </Flex>

        {error && <Alert type="error" showIcon description={error} />}

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <Form.Item
            name="quantity"
            label={t("products.inventoryDrawer.initialStock.quantityLabel")}
            rules={[
              {
                required: true,
                message: t(
                  "products.inventoryDrawer.initialStock.quantityRequired",
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              controls={false}
              min={0}
              precision={0}
              placeholder={t(
                "products.inventoryDrawer.initialStock.quantityPlaceholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="purchasePrice"
            label={t(
              "products.inventoryDrawer.initialStock.purchasePriceLabel",
              { currency },
            )}
            rules={[
              {
                required: true,
                message: t(
                  "products.inventoryDrawer.initialStock.purchasePriceRequired",
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              controls={false}
              min={0}
              precision={2}
              placeholder={t(
                "products.inventoryDrawer.initialStock.purchasePricePlaceholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <Flex justify="flex-end" gap={8} wrap="wrap">
          <Button disabled={submitting} onClick={onCancel}>
            {t("products.inventoryDrawer.initialStock.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<CheckIcon />}
            loading={submitting}
          >
            {t("products.inventoryDrawer.initialStock.submit")}
          </Button>
        </Flex>
      </Flex>
    </Form>
  );
};
