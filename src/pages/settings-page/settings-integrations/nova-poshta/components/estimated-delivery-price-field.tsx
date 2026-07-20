import { Col, Form, InputNumber, Row, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaEstimatedDeliveryPriceMode } from "../types";

type EstimatedDeliveryPriceFieldProps = {
  columnBreakpoint?: "sm" | "md";
};

export function EstimatedDeliveryPriceField({
  columnBreakpoint = "sm",
}: EstimatedDeliveryPriceFieldProps) {
  const { t } = useTranslation();
  const columnProps =
    columnBreakpoint === "md" ? { md: 12 as const } : { sm: 12 as const };
  const estimatedDeliveryPriceMode = Form.useWatch(
    "estimated_delivery_price_mode",
  );
  const isFixedMode = estimatedDeliveryPriceMode === "fixed";
  const modeOptions = useMemo(
    () => [
      {
        value: "order_amount",
        label: t(
          "integrations.novaPoshtaWizard.estimatedDeliveryPrice.orderAmount",
        ),
      },
      {
        value: "fixed",
        label: t(
          "integrations.novaPoshtaWizard.estimatedDeliveryPrice.fixedAmount",
        ),
      },
    ],
    [t],
  );

  return (
    <Row gutter={12}>
      <Col xs={24} {...columnProps}>
        <Form.Item
          label={t(
            "integrations.novaPoshtaWizard.fields.estimatedDeliveryPrice.label",
          )}
          name="estimated_delivery_price_mode"
          initialValue="order_amount"
        >
          <Select<NovaPoshtaEstimatedDeliveryPriceMode> options={modeOptions} />
        </Form.Item>
      </Col>

      {isFixedMode && (
        <Col xs={24} {...columnProps}>
          <Form.Item
            label={t(
              "integrations.novaPoshtaWizard.fields.estimatedDeliveryPriceFixed.label",
            )}
            name="estimated_delivery_price_fixed"
            rules={[
              {
                required: true,
                message: t(
                  "integrations.novaPoshtaWizard.fields.estimatedDeliveryPriceFixed.required",
                ),
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              controls={false}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.estimatedDeliveryPriceFixed.placeholder",
              )}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}
