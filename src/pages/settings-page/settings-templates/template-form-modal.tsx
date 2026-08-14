import { Form, Modal } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_TEMPLATE_FORM_VALUES,
  TemplateFormFields,
  type TemplateFormValues,
} from "./template-form-fields";

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
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
        style={{ marginTop: 8 }}
        initialValues={DEFAULT_TEMPLATE_FORM_VALUES}
      >
        <TemplateFormFields autoFocusName bodyDataQa="template-create-body" />
      </Form>
    </Modal>
  );
};
