import { CheckIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  StockCorrectionValues,
  StockPurchaseValues,
} from "@/features/inventory/model/inventory.types";

type StockMovementMode = "purchase" | "correction";

type StockMovementFormFields = {
  quantity?: number;
  purchasePrice?: number;
  reason?: string;
  comment?: string;
};

const WRITE_OFF_REASONS = [
  {
    value: "Брак",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.defect",
  },
  {
    value: "Пошкодження",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.damage",
  },
  {
    value: "Втрачено",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.lost",
  },
  {
    value: "Використано для власних потреб",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.internalUse",
  },
  {
    value: "Повернення постачальнику",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.supplierReturn",
  },
  {
    value: "Інвентаризація",
    labelKey: "products.inventoryDrawer.stockMovement.reasons.inventory",
  },
] as const;

type ProductInventoryStockMovementFormProps = {
  currency: string;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onCreatePurchase: (values: StockPurchaseValues) => Promise<void>;
  onCreateCorrection: (values: StockCorrectionValues) => Promise<void>;
};

export const ProductInventoryStockMovementForm = ({
  currency,
  submitting,
  error,
  onCancel,
  onCreatePurchase,
  onCreateCorrection,
}: ProductInventoryStockMovementFormProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<StockMovementFormFields>();
  const [mode, setMode] = useState<StockMovementMode>("purchase");
  const reasonOptions = useMemo(
    () =>
      WRITE_OFF_REASONS.map((reason) => ({
        value: reason.value,
        label: t(reason.labelKey),
      })),
    [t],
  );

  const handleModeChange = (value: string | number) => {
    const nextMode = value as StockMovementMode;

    setMode(nextMode);

    if (nextMode === "correction") {
      form.setFieldValue("reason", WRITE_OFF_REASONS[0].value);
    }
  };

  const handleFinish = (values: StockMovementFormFields) => {
    const quantity = Number(values.quantity ?? 0);
    const comment = values.comment?.trim() ?? "";
    const submit =
      mode === "purchase"
        ? onCreatePurchase({
            quantity,
            purchasePrice: Number(values.purchasePrice ?? 0),
            comment,
          })
        : onCreateCorrection({
            quantityChange: -Math.abs(quantity),
            reason: values.reason ?? WRITE_OFF_REASONS[0].value,
            comment,
          });

    void submit
      .then(() => {
        form.resetFields();
        form.setFieldValue("reason", WRITE_OFF_REASONS[0].value);
      })
      .catch(() => undefined);
  };

  return (
    <Form<StockMovementFormFields>
      form={form}
      layout="vertical"
      requiredMark
      initialValues={{ reason: WRITE_OFF_REASONS[0].value }}
      onFinish={handleFinish}
    >
      <Flex vertical gap={12}>
        <Segmented
          block
          value={mode}
          options={[
            {
              value: "purchase",
              label: t("products.inventoryDrawer.stockMovement.purchaseTab"),
            },
            {
              value: "correction",
              label: t("products.inventoryDrawer.stockMovement.writeOffTab"),
            },
          ]}
          onChange={handleModeChange}
        />

        {error && <Alert type="error" showIcon message={error} />}

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <Form.Item
            name="quantity"
            label={t("products.inventoryDrawer.stockMovement.quantityLabel")}
            rules={[
              {
                required: true,
                message: t(
                  "products.inventoryDrawer.stockMovement.quantityRequired",
                ),
              },
              {
                type: "number",
                min: 1,
                message: t(
                  "products.inventoryDrawer.stockMovement.quantityMin",
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              controls={false}
              min={1}
              precision={0}
              placeholder={t(
                "products.inventoryDrawer.stockMovement.quantityPlaceholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>

          {mode === "purchase" ? (
            <Form.Item
              name="purchasePrice"
              label={t(
                "products.inventoryDrawer.stockMovement.purchasePriceLabel",
                { currency },
              )}
              rules={[
                {
                  required: true,
                  message: t(
                    "products.inventoryDrawer.stockMovement.purchasePriceRequired",
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
                  "products.inventoryDrawer.stockMovement.purchasePricePlaceholder",
                )}
                style={{ width: "100%" }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="reason"
              label={t("products.inventoryDrawer.stockMovement.reasonLabel")}
              rules={[
                {
                  required: true,
                  message: t(
                    "products.inventoryDrawer.stockMovement.reasonRequired",
                  ),
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select options={reasonOptions} />
            </Form.Item>
          )}
        </div>

        <Form.Item
          name="comment"
          label={t("products.inventoryDrawer.stockMovement.commentLabel")}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder={t(
              "products.inventoryDrawer.stockMovement.commentPlaceholder",
            )}
          />
        </Form.Item>

        <Flex justify="flex-end" gap={8} wrap="wrap">
          <Button disabled={submitting} onClick={onCancel}>
            {t("products.inventoryDrawer.stockMovement.cancel")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<CheckIcon />}
            loading={submitting}
          >
            {mode === "purchase"
              ? t("products.inventoryDrawer.stockMovement.purchaseSubmit")
              : t("products.inventoryDrawer.stockMovement.writeOffSubmit")}
          </Button>
        </Flex>
      </Flex>
    </Form>
  );
};
