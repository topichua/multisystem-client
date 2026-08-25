import { Alert, Button, Checkbox, Form, Input } from "antd";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { phoneFieldRules } from "@/utils/phone-input";

import type { RegisterFormValues } from "./register-page";
import * as S from "./register-page.styled";

const privacyPolicyUrl = "https://multi-sale.com/privacy.html";

type RegisterFormContentProps = {
  form: ReturnType<typeof Form.useForm<RegisterFormValues>>[0];
  submitError: string | null;
  isSubmitting: boolean;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
};

export const RegisterFormContent = ({
  form,
  submitError,
  isSubmitting,
  onSubmit,
}: RegisterFormContentProps) => {
  const { t } = useTranslation();
  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        requiredMessage: t("register.phoneRequired"),
        invalidMessage: t("register.phoneInvalid"),
      }),
    [t],
  );

  return (
    <>
      <S.Header>
        <S.PageTitle>{t("register.title")}</S.PageTitle>
        <S.PageDescription>{t("register.description")}</S.PageDescription>
      </S.Header>

      {submitError && (
        <Alert
          type="error"
          showIcon
          title={submitError}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        disabled={isSubmitting}
        onFinish={onSubmit}
      >
        <Form.Item
          label={t("register.companyName")}
          name="companyName"
          rules={[
            {
              required: true,
              message: t("register.companyNameRequired"),
            },
          ]}
        >
          <Input
            placeholder={t("register.companyNamePlaceholder")}
            autoComplete="organization"
          />
        </Form.Item>

        <S.TwoColumnFields>
          <Form.Item
            label={t("register.firstName")}
            name="firstName"
            rules={[
              {
                required: true,
                message: t("register.firstNameRequired"),
              },
            ]}
          >
            <Input
              placeholder={t("register.firstNamePlaceholder")}
              autoComplete="given-name"
            />
          </Form.Item>

          <Form.Item
            label={t("register.lastName")}
            name="lastName"
            rules={[
              {
                required: true,
                message: t("register.lastNameRequired"),
              },
            ]}
          >
            <Input
              placeholder={t("register.lastNamePlaceholder")}
              autoComplete="family-name"
            />
          </Form.Item>
        </S.TwoColumnFields>

        <Form.Item
          label={t("register.email")}
          name="email"
          extra={t("register.emailHint")}
          rules={[
            { required: true, message: t("register.emailRequired") },
            { type: "email", message: t("register.emailInvalid") },
          ]}
        >
          <Input
            placeholder={t("register.emailPlaceholder")}
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item label={t("register.phone")} name="phone" rules={phoneRules}>
          <ClientPhoneFormInput
            placeholder={t("register.phonePlaceholder")}
            autoComplete="tel"
          />
        </Form.Item>

        <S.TwoColumnFields>
          <Form.Item
            label={t("register.password")}
            name="password"
            rules={[
              {
                required: true,
                message: t("register.passwordRequired"),
              },
              {
                min: 8,
                message: t("register.passwordMin"),
              },
            ]}
          >
            <Input.Password
              placeholder={t("register.passwordPlaceholder")}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label={t("register.confirmPassword")}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: t("register.confirmPasswordRequired"),
              },
              ({ getFieldValue }) => ({
                validator(_, value: string | undefined) {
                  if (!value || value === getFieldValue("password")) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(t("register.passwordMismatch")),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={t("register.confirmPasswordPlaceholder")}
              autoComplete="new-password"
            />
          </Form.Item>
        </S.TwoColumnFields>

        <S.FieldHint>{t("register.passwordHint")}</S.FieldHint>

        <Form.Item
          name="acceptTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value: boolean | undefined) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error(t("register.termsRequired"))),
            },
          ]}
        >
          <Checkbox>
            <Trans
              i18nKey="register.termsLabel"
              components={{
                termsLink: (
                  <S.InlineLink
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                privacyLink: (
                  <S.InlineLink
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </Checkbox>
        </Form.Item>

        <S.FormActions>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            {t("register.submit")}
          </Button>
        </S.FormActions>
      </Form>

      <S.Footer>
        <Trans
          i18nKey="register.hasAccount"
          components={{
            loginLink: <Link to={pagesMap.login} />,
          }}
        />
      </S.Footer>

      <S.Disclaimer>
        <Trans
          i18nKey="register.disclaimer"
          components={{
            termsLink: (
              <S.InlineLink
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            privacyLink: (
              <S.InlineLink
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </S.Disclaimer>
    </>
  );
};
