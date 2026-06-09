import { Form, Input, Modal } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

export type TemplateFormValues = {
  name: string;
  template: string;
};

type TemplateFormModalProps = {
  open: boolean;
  form: FormInstance<TemplateFormValues>;
  saveLoading: boolean;
  onCancel: () => void;
  onOk: () => Promise<void>;
};

export const TemplateFormModal = ({
  open,
  form,
  saveLoading,
  onCancel,
  onOk,
}: TemplateFormModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("templates.modalCreateTitle")}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saveLoading}
      destroyOnHidden
      okText={t("templates.modalOk")}
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
        style={{ marginTop: 8 }}
        initialValues={{ name: "", template: "" }}
      >
        <Form.Item
          name="name"
          label={t("templates.name")}
          rules={[{ required: true, message: t("templates.required") }]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item
          name="template"
          label={t("templates.body")}
          rules={[{ required: true, message: t("templates.required") }]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
