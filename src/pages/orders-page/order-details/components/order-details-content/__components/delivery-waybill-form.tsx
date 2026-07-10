import { PlusIcon } from "@phosphor-icons/react";
import { Button, Form, Input, InputNumber } from "antd";
import type { FormInstance } from "antd";

import type { OrderDetails } from "@/features/orders/model/order.types";

import type { TranslationFn } from "../order-details-content.types";
import type { WaybillFormValues } from "../utils/nova-poshta-waybill.utils";
import * as S from "../order-details-content.styled";

type DeliveryWaybillFormProps = {
  order: OrderDetails;
  t: TranslationFn;
  waybillForm: FormInstance<WaybillFormValues>;
  waybillInitialValues: WaybillFormValues;
  deliveryShipped: boolean;
  waybillActionLoading: boolean;
  createDisabledReason: string | null;
  canCreateWaybill: boolean;
  onCreateWaybill: () => void;
};

export const DeliveryWaybillForm = ({
  order,
  t,
  waybillForm,
  waybillInitialValues,
  deliveryShipped,
  waybillActionLoading,
  createDisabledReason,
  canCreateWaybill,
  onCreateWaybill,
}: DeliveryWaybillFormProps) => (
  <S.WaybillForm className="no-print">
    <Form
      disabled={deliveryShipped || waybillActionLoading}
      form={waybillForm}
      initialValues={waybillInitialValues}
      layout="vertical"
    >
      <S.WaybillFormGrid>
        <Form.Item
          label={t("orders.details.waybillWeight")}
          name="weightGrams"
          rules={[
            {
              required: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            controls={false}
            addonAfter={t("orders.create.shipment.grams")}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={t("orders.details.waybillSeatsAmount")}
          name="seatsAmount"
          rules={[
            {
              required: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            controls={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={t("orders.details.waybillSeatsCount")}
          name="seatsCount"
          rules={[
            {
              required: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            controls={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={t("orders.details.waybillDeclaredCost")}
          name="declaredCost"
          rules={[
            {
              required: true,
              message: t("orders.details.requiredField"),
            },
          ]}
        >
          <InputNumber
            min={0}
            controls={false}
            addonAfter={order.currency}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </S.WaybillFormGrid>

      <Form.Item
        label={t("orders.details.waybillDescription")}
        name="description"
        rules={[
          {
            required: true,
            whitespace: true,
            message: t("orders.details.requiredField"),
          },
        ]}
      >
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>

      <S.WaybillActions>
        {createDisabledReason ? (
          <S.WaybillHint type="secondary">{createDisabledReason}</S.WaybillHint>
        ) : null}

        <Button
          type="primary"
          disabled={!canCreateWaybill}
          icon={<PlusIcon size={18} />}
          loading={waybillActionLoading}
          onClick={onCreateWaybill}
        >
          {t("orders.details.createWaybill")}
        </Button>
      </S.WaybillActions>
    </Form>
  </S.WaybillForm>
);
