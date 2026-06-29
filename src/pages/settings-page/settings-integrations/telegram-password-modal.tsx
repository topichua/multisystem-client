import { XIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Input, Modal, Typography, theme } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";

type TelegramPasswordFormValues = {
  password: string;
};

type TelegramPasswordModalProps = {
  open: boolean;
  hint: string | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
};

export function TelegramPasswordModal({
  open,
  hint,
  submitting,
  onCancel,
  onSubmit,
}: TelegramPasswordModalProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<TelegramPasswordFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      centered
      closeIcon={<XIcon />}
      destroyOnHidden
      footer={null}
      open={open}
      title={null}
      width={460}
      onCancel={onCancel}
    >
      <Flex
        vertical
        align="center"
        gap={16}
        style={{
          paddingBlockStart: token.paddingSM,
          paddingBlockEnd: token.paddingXXS,
          paddingInline: token.paddingXS,
          textAlign: "center",
        }}
      >
        <TelegramLogoIcon size={56} />

        <Flex vertical align="center" gap={8}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t("integrations.telegramPassword.title")}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeLG,
              lineHeight: token.lineHeightLG,
            }}
          >
            {hint ?? t("integrations.telegramPassword.subtitle")}
          </Typography.Text>
        </Flex>

        <Form
          form={form}
          layout="vertical"
          requiredMark
          style={{ width: "100%" }}
          onFinish={(values) => onSubmit(values.password)}
        >
          <Form.Item
            name="password"
            label={t("integrations.telegramPassword.passwordLabel")}
            rules={[
              {
                required: true,
                message: t("integrations.telegramPassword.passwordRequired"),
              },
            ]}
          >
            <Input.Password
              autoFocus
              disabled={submitting}
              placeholder={t("integrations.telegramPassword.passwordPlaceholder")}
              onPressEnter={() => form.submit()}
            />
          </Form.Item>
          <Button
            block
            disabled={submitting}
            htmlType="submit"
            loading={submitting}
            type="primary"
          >
            {t("integrations.telegramPassword.submit")}
          </Button>
        </Form>
      </Flex>
    </Modal>
  );
}
