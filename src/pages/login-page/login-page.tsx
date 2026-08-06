import { Button, Checkbox, Divider, Flex, Form, Input } from "antd";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { GoogleLogoIcon } from "@/components/icons/google/google-logo-icon";
import { authApi, type LoginRequest } from "@/features/auth/api/auth-api";
import { useAuth } from "@/features/auth/model/use-auth";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "./login-page.styled";

type LoginFormValues = LoginRequest & {
  rememberMe?: boolean;
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    await authApi
      .login({
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        login(response.access_token);
      })
      .catch(() => {
        notification.error({ title: t("login.invalidCredentials") });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoogleLogin = () => {
    alert("Google login will be implemented soon");
  };

  return (
    <S.Page>
      <S.FormSide>
        <S.LoginCard>
          <S.Header>
            <S.PageTitle>{t("login.title")}</S.PageTitle>
            <S.PageDescription>{t("login.description")}</S.PageDescription>
          </S.Header>

          <Button block icon={<GoogleLogoIcon />} onClick={handleGoogleLogin}>
            {t("login.google")}
          </Button>

          <Divider plain>{t("login.orEmail")}</Divider>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            disabled={isSubmitting}
            initialValues={{ rememberMe: true }}
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

            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>{t("login.rememberMe")}</Checkbox>
                </Form.Item>

                <Button
                  type="link"
                  htmlType="button"
                  style={{ paddingInline: 0 }}
                  onClick={() => navigate(pagesMap.forgotPassword)}
                >
                  {t("login.forgotPassword")}
                </Button>
              </Flex>
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

          <S.Footer>
            <Trans
              i18nKey="login.noAccount"
              components={{
                registerLink: <Link to={pagesMap.register} />,
              }}
            />
          </S.Footer>
        </S.LoginCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};
