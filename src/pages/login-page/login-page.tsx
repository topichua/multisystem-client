import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { authApi, type LoginRequest } from "@/features/auth/api/auth-api";
import { useAuth } from "@/features/auth/model/use-auth";

import * as S from "./login-page.styled";

type LoginFormValues = LoginRequest;

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    await authApi
      .login(values)
      .then((response) => {
        login(response.access_token);
      })
      .catch(() => {
        messageApi.error(t("login.invalidCredentials"));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <S.Page>
      {contextHolder}
      <S.FormSide>
        <S.LoginCard>
          <S.Header>
            <S.Brand>
              <S.Logo src="/logos/logo.png" alt={t("brand")} />
              <S.PageTitle>{t("brand")}</S.PageTitle>
            </S.Brand>
          </S.Header>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label={t("login.email")}
              name="email"
              rules={[
                { required: true, message: t("login.emailRequired") },
                { type: "email", message: t("login.emailInvalid") },
              ]}
            >
              <Input
                placeholder={t("login.emailPlaceholder")}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label={t("login.password")}
              name="password"
              rules={[{ required: true, message: t("login.passwordRequired") }]}
            >
              <Input.Password
                placeholder={t("login.passwordPlaceholder")}
                autoComplete="current-password"
              />
            </Form.Item>

            <S.FormActions>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
              >
                {t("login.submit")}
              </Button>
            </S.FormActions>
          </Form>
        </S.LoginCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};
