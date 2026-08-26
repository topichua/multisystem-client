import { Button, Form, Input } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { FormCard, FormDivider } from "@/components/layout/form-card";
import { authApi } from "@/features/auth/api/auth-api";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "./settings-user-view.styled";

type ChangePasswordFormValues = {
  existingPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const SettingsUserPasswordCard = () => {
  const { t } = useTranslation();
  const notification = useNotification();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      setSaving(true);

      try {
        await authApi.changePassword({
          existing_password: values.existingPassword,
          new_password: values.newPassword,
        });
        form.resetFields();
        setDirty(false);
        notification.success({
          title: t("userSettings.passwordUpdateSuccess"),
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("userSettings.passwordUpdateError"),
          ),
        });
      } finally {
        setSaving(false);
      }
    },
    [form, notification, t],
  );

  return (
    <FormCard>
      <S.FormSectionTitle level={5}>
        {t("userSettings.changePasswordTitle")}
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
          <Form.Item></Form.Item>
          <Form.Item
            name="newPassword"
            label={t("userSettings.newPassword")}
            rules={[
              {
                required: true,
                message: t("userSettings.newPasswordRequired"),
              },
              {
                min: 8,
                message: t("userSettings.newPasswordMin"),
              },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t("userSettings.confirmNewPassword")}
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: t("userSettings.confirmNewPasswordRequired"),
              },
              ({ getFieldValue }) => ({
                validator(_, value: string | undefined) {
                  if (!value || value === getFieldValue("newPassword")) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(t("userSettings.passwordMismatch")),
                  );
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
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
            {t("userSettings.savePassword")}
          </Button>
        </S.FormFooter>
      </Form>
    </FormCard>
  );
};
