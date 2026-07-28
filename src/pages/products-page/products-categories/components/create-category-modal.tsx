import { CheckOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Modal, Typography } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { CATEGORY_NAME_MAX_LENGTH } from "../products-categories.constants";

type CreateCategoryModalProps = {
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string) => Promise<void>;
};

type CreateCategoryFormValues = {
  name: string;
};

export const CreateCategoryModal = ({
  loading,
  open,
  onCancel,
  onCreate,
}: CreateCategoryModalProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateCategoryFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      await onCreate(values.name.trim());
      form.resetFields();
    } catch {
      // Validation is rendered by AntD; API errors are handled by the caller.
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      destroyOnHidden
      centered
      title={t("categories.modalCreateRootTitle")}
      width={440}
      open={open}
      onCancel={handleCancel}
      footer={
        <Flex gap={8}>
          <Button block size="large" onClick={handleCancel} disabled={loading}>
            {t("categories.cancel")}
          </Button>
          <Button
            block
            size="large"
            type="primary"
            icon={<CheckOutlined />}
            loading={loading}
            onClick={() => void handleCreate()}
          >
            {t("categories.okCreate")}
          </Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={t("categories.name").toUpperCase()}
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("categories.nameRequired"),
            },
            {
              max: CATEGORY_NAME_MAX_LENGTH,
              message: t("categories.nameTooLong"),
            },
          ]}
        >
          <Input
            autoFocus
            size="large"
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            placeholder={t("categories.rootNamePlaceholder")}
            onPressEnter={() => void handleCreate()}
          />
        </Form.Item>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t("categories.rootCreateHint")}
        </Typography.Paragraph>
      </Form>
    </Modal>
  );
};
