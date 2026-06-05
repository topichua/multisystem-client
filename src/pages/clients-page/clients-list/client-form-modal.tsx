import { Form, Input, Modal } from "antd";
import type { FormInstance } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import type { Client } from "@/features/clients/model/client.types";
import { phoneFieldRules } from "@/utils/phone-input";

import {
  emptyClientFormValues,
  type ClientFormValues,
} from "./controllers/use-clients-list-controller";

type ClientFormModalProps = {
  editingClient: Client | null;
  form: FormInstance<ClientFormValues>;
  open: boolean;
  saveLoading: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
};

export function ClientFormModal({
  editingClient,
  form,
  open,
  saveLoading,
  onCancel,
  onSubmit,
}: ClientFormModalProps) {
  const { t } = useTranslation();
  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        requiredMessage: t("clients.required"),
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );

  return (
    <Modal
      title={
        editingClient
          ? t("clients.modalEditTitle")
          : t("clients.modalCreateTitle")
      }
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editingClient ? t("clients.save") : t("clients.modalCreateOk")}
      confirmLoading={saveLoading}
      destroyOnHidden
      width={480}
    >
      <Form form={form} layout="vertical" initialValues={emptyClientFormValues}>
        <Form.Item
          name="first_name"
          label={t("clients.firstName")}
          rules={[{ required: true, message: t("clients.required") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="last_name"
          label={t("clients.lastName")}
          rules={[{ required: true, message: t("clients.required") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="phone" label={t("clients.phone")} rules={phoneRules}>
          <ClientPhoneFormInput
            autoComplete="tel"
            placeholder={t("clients.phonePlaceholder")}
          />
        </Form.Item>
        <Form.Item
          name="delivery_info"
          required
          label={t("clients.deliveryInfo")}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
