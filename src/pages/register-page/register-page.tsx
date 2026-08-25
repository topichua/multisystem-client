import { Button, Form, Result } from "antd";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { authApi } from "@/features/auth/api/auth-api";

import * as S from "./register-page.styled";
import { RegisterFormContent } from "./register-form-content";

export type RegisterFormValues = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const isEmailAlreadyInUseError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 409;

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<RegisterFormValues>();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    form.setFields([{ name: "email", errors: [] }]);
    setIsSubmitting(true);

    try {
      const email = values.email.trim();

      await authApi.registerStart({
        companyName: values.companyName.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
        phone: values.phone.trim(),
        password: values.password,
      });

      setSubmittedEmail(email);
    } catch (error) {
      if (isEmailAlreadyInUseError(error)) {
        form.setFields([
          {
            name: "email",
            errors: [t("register.emailExists")],
          },
        ]);
        return;
      }

      setSubmitError(getApiErrorMessage(error, t("register.submitError")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = submittedEmail !== null;

  return (
    <S.Page>
      <S.FormSide>
        <S.RegisterCard>
          {isCompleted ? (
            <Result
              status="success"
              title={t("register.successTitle")}
              subTitle={t("register.successDescription", {
                email: submittedEmail,
              })}
              extra={
                <Link to={pagesMap.login}>
                  <Button type="primary">{t("register.goToLogin")}</Button>
                </Link>
              }
            />
          ) : (
            <RegisterFormContent
              form={form}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </S.RegisterCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};
