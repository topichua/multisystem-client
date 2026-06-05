import { Col, Form, Input, Row, Select } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderFormValues } from "@/features/orders/model/order.types";

type SelectOption = {
  value: string;
  label: string;
};

type ClientOrderDeliveryFormProps = {
  billingMethodOptions: SelectOption[];
  deliveryMethodOptions: SelectOption[];
  form: FormInstance<OrderFormValues>;
};

export function ClientOrderDeliveryForm({
  billingMethodOptions,
  deliveryMethodOptions,
  form,
}: ClientOrderDeliveryFormProps) {
  const { t } = useTranslation();

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={t("conversation.clientOrders.drawer.deliveryMethodLabel")}
            name="deliveryMethod"
          >
            <Select
              placeholder={t(
                "conversation.clientOrders.drawer.deliveryMethodPlaceholder",
              )}
              options={deliveryMethodOptions}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t("conversation.clientOrders.drawer.postAddressLabel")}
            name="postAddress"
          >
            <Select
              placeholder={t(
                "conversation.clientOrders.drawer.postAddressPlaceholder",
              )}
              options={[
                { value: "jack", label: "Jack" },
                { value: "lucy", label: "Lucy" },
                { value: "Yiminghe", label: "Yiminghe" },
                { value: "disabled", label: "Disabled" },
              ]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t("conversation.clientOrders.drawer.billingMethodLabel")}
            name="billingMethod"
          >
            <Select
              placeholder={t(
                "conversation.clientOrders.drawer.billingMethodPlaceholder",
              )}
              options={billingMethodOptions}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t("conversation.clientOrders.drawer.commentLabel")}
            name="comment"
          >
            <Input
              placeholder={t(
                "conversation.clientOrders.drawer.commentPlaceholder",
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
