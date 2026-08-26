import { Button, Form, Input } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { FormCard, FormDivider } from "@/components/layout/form-card";
import { authApi } from "@/features/auth/api/auth-api";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { emailFieldRules } from "@/utils/email-input";

import * as S from "./settings-user-view.styled";

type ChangeEmailFormValues = {
  newEmail: string;
  existingPassword: string;
};

export const SettingsUserEmailCard = () => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const notification = useNotification();
  const [form] = Form.useForm<ChangeEmailFormValues>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const newEmailRules = useMemo(
    () =>
      emailFieldRules({
        requiredMessage: t("userSettings.newEmailRequired"),
        invalidMessage: t("userSettings.newEmailInvalid"),
      }),
    [t],
  );

  const handleSubmit = useCallback(
    async (values: ChangeEmailFormValues) => {
      setSaving(true);

      try {
        await authApi.setEmail({
          new_email: values.newEmail.trim(),
          existing_password: values.existingPassword,
        });
        await userStore.loadAuth();
        form.resetFields();
        setDirty(false);
        notification.success({ title: t("userSettings.emailUpdateSuccess") });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("userSettings.emailUpdateError")),
        });
      } finally {
        setSaving(false);
      }
    },
    [form, notification, t, userStore],
  );

  return (
    <FormCard>
      <S.FormSectionTitle level={5}>
        {t("userSettings.changeEmailTitle")}
      </S.FormSectionTitle>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onValuesChange={() => setDirty(true)}
        onFinish={handleSubmit}
      >
        <S.FormGrid>
          <Form.Item
            name="newEmail"
            label={t("userSettings.newEmail")}
            rules={newEmailRules}
          >
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="existingPassword"
            label={t("userSettings.currentPassword")}
            rules={[
              {
                required: true,
                message: t("userSettings.currentPasswordRequired"),
              },
            ]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
        </S.FormGrid>

        <FormDivider />

        <S.FormFooter>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            disabled={!dirty}
          >
            {t("userSettings.saveEmail")}
          </Button>
        </S.FormFooter>
      </Form>
    </FormCard>
  );
};
