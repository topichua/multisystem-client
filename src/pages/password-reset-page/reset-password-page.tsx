import { Alert, Button, Form, Input, Result } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { authApi } from "@/features/auth/api/auth-api";

import * as S from "./password-reset-page.styled";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const resetToken = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const hasToken = resetToken !== "";

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!hasToken) {
      setSubmitError(t("passwordReset.resetMissingToken"));
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token: resetToken,
        password: values.password,
      });

      form.resetFields();
      setIsCompleted(true);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, t("passwordReset.resetSubmitError")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isCompleted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(pagesMap.login, { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCompleted, navigate]);

  return (
    <S.Page>
      <S.FormSide>
        <S.PasswordResetCard>
          {isCompleted ? (
            <Result
              status="success"
              title={t("passwordReset.resetSuccessTitle")}
              subTitle={t("passwordReset.resetSuccessDescription")}
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
                <S.PageTitle>{t("passwordReset.resetTitle")}</S.PageTitle>
                <S.PageDescription>
                  {t("passwordReset.resetDescription")}
                </S.PageDescription>
              </S.Header>

              {!hasToken && (
                <Alert
                  type="error"
                  showIcon
                  title={t("passwordReset.resetMissingToken")}
                  style={{ marginBottom: 24 }}
                />
              )}

              {submitError && (
                <Alert
                  type="error"
                  showIcon
                  title={submitError}
                  style={{ marginBottom: 24 }}
                />
              )}

              {hasToken && (
                <Form
                  form={form}
                  layout="vertical"
                  autoComplete="off"
                  disabled={isSubmitting}
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    label={t("passwordReset.password")}
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: t("passwordReset.passwordRequired"),
                      },
                      {
                        min: 8,
                        message: t("passwordReset.passwordMin"),
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder={t("passwordReset.passwordPlaceholder")}
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    label={t("passwordReset.confirmPassword")}
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: t("passwordReset.confirmPasswordRequired"),
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value: string | undefined) {
                          if (!value || value === getFieldValue("password")) {
                            return Promise.resolve();
                          }

                          return Promise.reject(
                            new Error(t("passwordReset.passwordMismatch")),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder={t(
                        "passwordReset.confirmPasswordPlaceholder",
                      )}
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <S.FormActions>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={isSubmitting}
                    >
                      {t("passwordReset.resetSubmit")}
                    </Button>
                  </S.FormActions>
                </Form>
              )}

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
