import { Checkbox, Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { OrderStatus } from "@/features/orders/model/order.types";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { isDuplicateOrderStatusName } from "./order-status-name-validation";

const { Text } = Typography;

export type OrderStatusFormValues = {
  name: string;
  color: string;
  isDefault: boolean;
};

type OrderStatusFormFieldsProps = {
  statuses: OrderStatus[];
  editingStatusId?: number | null;
};

export const OrderStatusFormFields = ({
  statuses,
  editingStatusId,
}: OrderStatusFormFieldsProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();

  return (
    <>
      <Form.Item
        name="name"
        label={t("orderStatuses.fieldName")}
        rules={[
          { required: true, message: t("orderStatuses.nameRequired") },
          {
            validator: async (_, value: string) => {
              if (value == null || String(value).trim() === "") {
                return;
              }

              if (
                isDuplicateOrderStatusName(
                  value,
                  statuses,
                  editingStatusId ?? undefined,
                )
              ) {
                throw new Error(t("orderStatuses.duplicateName"));
              }
            },
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="color"
        label={t("orderStatuses.fieldColor")}
        rules={[{ required: true, message: t("orderStatuses.pickColor") }]}
      >
        <PresetColorPicker
          ariaLabel={t("orderStatuses.colorPickerAria")}
          columns={isMobileViewport ? 5 : undefined}
        />
      </Form.Item>
      <Form.Item name="isDefault" valuePropName="checked">
        <Checkbox>
          {t("orderStatuses.fieldDefault")}{" "}
          <Text type="secondary">{t("orderStatuses.fieldDefaultHint")}</Text>
        </Checkbox>
      </Form.Item>
    </>
  );
};
