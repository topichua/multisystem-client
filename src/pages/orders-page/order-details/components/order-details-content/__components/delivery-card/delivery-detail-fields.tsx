import {
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Typography,
} from "antd";

import type { NovaPoshtaDeliveryType } from "@/features/integrations/model/integration.types";

import type { TranslationFn } from "../../order-details-content.types";
import {
  drawerKey,
  getShipmentTypeLabel,
  SHIPMENT_TYPE_OPTIONS,
} from "./delivery-card.utils";
import type { PaymentMode } from "./delivery-card.types";

const { Text } = Typography;
const fullWidth = { width: "100%" };

type DeliveryPaymentFieldsProps = {
  paymentMode: PaymentMode;
  paymentModeOptions: Array<{ label: string; value: PaymentMode }>;
  t: TranslationFn;
  onPaymentModeChange: (value: PaymentMode) => void;
};

export function DeliveryRecipientFields({ t }: { t: TranslationFn }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          label={t("orders.recipientName")}
          name="recipientName"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label={t("orders.phone")}
          name="phone"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
    </Row>
  );
}

export function DeliveryPaymentFields({
  paymentMode,
  paymentModeOptions,
  t,
  onPaymentModeChange,
}: DeliveryPaymentFieldsProps) {
  return (
    <>
      <Divider />

      <Form.Item label={t("orders.details.deliveryPayer")} name="payerType">
        <Select
          options={[
            {
              label: t("orders.details.deliveryPayerRecipient"),
              value: "recipient",
            },
            {
              label: t("orders.details.deliveryPayerSender"),
              value: "sender",
            },
          ]}
        />
      </Form.Item>

      <Form.Item label={t("orders.details.paymentMethod")} name="paymentMode">
        <Segmented<PaymentMode>
          block
          options={paymentModeOptions}
          onChange={onPaymentModeChange}
        />
      </Form.Item>

      {paymentMode === "cash_on_delivery" && (
        <Form.Item
          label={t(drawerKey("cashOnDeliveryAmountLabel"))}
          name="cashOnDeliveryAmount"
        >
          <InputNumber
            min={0}
            controls={false}
            addonAfter={t(drawerKey("uah"))}
            style={fullWidth}
          />
        </Form.Item>
      )}
    </>
  );
}

export function DeliveryPackageFields({ t }: { t: TranslationFn }) {
  const shipmentTypeOptions = SHIPMENT_TYPE_OPTIONS.map((value) => ({
    value,
    label: getShipmentTypeLabel(value, t),
  }));

  return (
    <>
      <Divider />

      <Text strong>{t("orders.details.deliveryAdditionalSettings")}</Text>
      <Row gutter={16}>
        <Col xs={12} md={6}>
          <Form.Item
            label={t("orders.details.waybillWeightKg")}
            name="weightKg"
          >
            <InputNumber
              min={0.1}
              step={0.1}
              controls={false}
              style={fullWidth}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item label={t("orders.details.lengthCm")} name="lengthCm">
            <InputNumber
              min={1}
              precision={0}
              controls={false}
              style={fullWidth}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item label={t("orders.details.widthCm")} name="widthCm">
            <InputNumber
              min={1}
              precision={0}
              controls={false}
              style={fullWidth}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item label={t("orders.details.heightCm")} name="heightCm">
            <InputNumber
              min={1}
              precision={0}
              controls={false}
              style={fullWidth}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t("orders.details.shipmentType")}
            name="shipmentType"
          >
            <Select<NovaPoshtaDeliveryType> options={shipmentTypeOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={t("orders.details.waybillSeatsAmount")}
            name="seatsAmount"
          >
            <InputNumber
              min={1}
              precision={0}
              controls={false}
              style={fullWidth}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export function ExistingWaybillFields({ t }: { t: TranslationFn }) {
  return (
    <Form.Item
      label={t("orders.details.waybillNumber")}
      name="trackingNumber"
      rules={[
        {
          required: true,
          whitespace: true,
          message: t("orders.details.requiredField"),
        },
      ]}
    >
      <Input placeholder={t("orders.details.waybillNumberPlaceholder")} />
    </Form.Item>
  );
}
