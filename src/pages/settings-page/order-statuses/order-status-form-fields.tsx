import { TrashIcon } from "@phosphor-icons/react";
import { Button, Divider, Form, Input, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";

import type {
  OrderStatus,
  OrderStatusCategory,
} from "@/features/orders/model/order.types";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { OrderStatusCategorySelect } from "./order-status-category-select";
import { isDuplicateOrderStatusName } from "./order-status-name-validation";

export type OrderStatusFormValues = {
  name: string;
  category: OrderStatusCategory;
  color: string;
};

type OrderStatusFormFieldsProps = {
  statuses: OrderStatus[];
  editingStatusId?: number | null;
  isSystem?: boolean;
  deleteLoading?: boolean;
  onDelete?: () => Promise<void>;
  deleteDataQa?: string;
};

export const OrderStatusFormFields = ({
  statuses,
  editingStatusId,
  isSystem = false,
  deleteLoading = false,
  onDelete,
  deleteDataQa,
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
        name="category"
        label={t("orderStatuses.fieldCategory")}
        rules={[
          { required: true, message: t("orderStatuses.categoryRequired") },
        ]}
      >
        <OrderStatusCategorySelect statuses={statuses} disabled={isSystem} />
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

      {!isSystem && onDelete ? (
        <>
          <Divider />
          <Popconfirm
            title={t("orderStatuses.deleteConfirm")}
            description={t("orderStatuses.deleteWarning")}
            okText={t("orderStatuses.delete")}
            okButtonProps={{ danger: true }}
            onConfirm={() => void onDelete()}
          >
            <Button
              danger
              type={isMobileViewport ? "default" : "text"}
              block={isMobileViewport}
              icon={<TrashIcon size={18} />}
              loading={deleteLoading}
              data-qa={deleteDataQa}
              aria-label={t("orderStatuses.deleteStatusAria")}
              style={
                isMobileViewport
                  ? undefined
                  : { alignSelf: "flex-start", paddingInline: 0 }
              }
            >
              {t("orderStatuses.deleteStatus")}
            </Button>
          </Popconfirm>
        </>
      ) : null}
    </>
  );
};
