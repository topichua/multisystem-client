import { Button, Form, Input, Result } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import {
  authApi,
  type ForgotPasswordRequest,
} from "@/features/auth/api/auth-api";

import * as S from "./password-reset-page.styled";

type ForgotPasswordFormValues = ForgotPasswordRequest;

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({
        email: values.email.trim(),
      });
    } catch {
      // Keep the same visible result so the UI does not reveal whether an email exists.
    } finally {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <S.Page>
      <S.FormSide>
        <S.PasswordResetCard>
          {isSubmitted ? (
            <Result
              status="success"
              title={t("passwordReset.forgotSuccessTitle")}
              subTitle={t("passwordReset.forgotSuccessDescription")}
              extra={
                <Link to={pagesMap.login}>
                  <Button type="primary">{t("passwordReset.goToLogin")}</Button>
                </Link>
              }
            />
          ) : (
            <>
              <S.Header>
                <S.Brand>
                  <S.Logo src="/logos/logo.png" alt={t("brand")} />
                  <S.BrandName>{t("brand")}</S.BrandName>
                </S.Brand>
                <S.PageTitle>{t("passwordReset.forgotTitle")}</S.PageTitle>
                <S.PageDescription>
                  {t("passwordReset.forgotDescription")}
                </S.PageDescription>
              </S.Header>

              <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                disabled={isSubmitting}
                onFinish={handleSubmit}
              >
                <Form.Item
                  label={t("passwordReset.email")}
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: t("passwordReset.emailRequired"),
                    },
                    { type: "email", message: t("passwordReset.emailInvalid") },
                  ]}
                >
                  <Input
                    placeholder={t("passwordReset.emailPlaceholder")}
                    autoComplete="username"
                  />
                </Form.Item>

                <S.FormActions>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isSubmitting}
                  >
                    {t("passwordReset.forgotSubmit")}
                  </Button>
                </S.FormActions>
              </Form>

              <S.Footer>
                <Link to={pagesMap.login}>
                  {t("passwordReset.backToLogin")}
                </Link>
              </S.Footer>
            </>
          )}
        </S.PasswordResetCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};
