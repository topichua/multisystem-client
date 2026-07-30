import { Form, Input, Modal } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { OrderStatus } from "@/features/orders/model/order.types";

import { OrderStatusCategorySelect } from "./order-status-category-select";
import type { OrderStatusFormValues } from "./order-status-form-fields";
import { isDuplicateOrderStatusName } from "./order-status-name-validation";

type OrderStatusCreateModalProps = {
  open: boolean;
  statuses: OrderStatus[];
  form: FormInstance<OrderStatusFormValues>;
  saveLoading: boolean;
  onCancel: () => void;
  onOk: () => Promise<void>;
};

export const OrderStatusCreateModal = ({
  open,
  statuses,
  form,
  saveLoading,
  onCancel,
  onOk,
}: OrderStatusCreateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("orderStatuses.modalCreateTitle")}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saveLoading}
      destroyOnHidden
      okText={t("orderStatuses.modalOk")}
      cancelText={t("orderStatuses.modalCancel")}
      data-qa="order-status-create-modal"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          name="name"
          label={t("orderStatuses.fieldName")}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("orderStatuses.nameRequired"),
            },
            {
              validator: async (_, value: string) => {
                if (value == null || String(value).trim() === "") {
                  return;
                }

                if (isDuplicateOrderStatusName(value, statuses)) {
                  throw new Error(t("orderStatuses.duplicateName"));
                }
              },
            },
          ]}
        >
          <Input
            autoFocus
            placeholder={t("orderStatuses.namePlaceholder")}
            data-qa="order-status-create-name"
          />
        </Form.Item>
        <Form.Item
          name="category"
          label={t("orderStatuses.fieldCategory")}
          rules={[
            { required: true, message: t("orderStatuses.categoryRequired") },
          ]}
        >
          <OrderStatusCategorySelect statuses={statuses} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
