import { Alert, Button, Form, Input, Typography } from "antd";
import type { FormInstance } from "antd";
import { Trans, useTranslation } from "react-i18next";

import type { WorkspaceMemberRegisterInfo } from "@/features/workspace-members/model/workspace-member.types";

import type { InvitationFormValues } from "./use-invitation-registration";
import * as S from "./invitation-page.styled";

type InvitationFormProps = {
  form: FormInstance<InvitationFormValues>;
  inviteInfo: WorkspaceMemberRegisterInfo;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (values: InvitationFormValues) => Promise<void>;
};

export const InvitationForm = ({
  form,
  inviteInfo,
  isSubmitting,
  submitError,
  onSubmit,
}: InvitationFormProps) => {
  const { t } = useTranslation();

  return (
    <>
      <S.Header>
        <S.PageTitle>{t("invitation.title")}</S.PageTitle>

        <S.PageDescription>
          <Trans
            i18nKey="invitation.description"
            values={{
              workspaceName:
                inviteInfo.workspaceName ??
                inviteInfo.workspace_name ??
                t("brand"),
            }}
            components={{
              strong: <Typography.Text strong />,
            }}
          />
        </S.PageDescription>
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
        <S.NameFields>
          <Form.Item
            label={t("invitation.firstName")}
            name="firstName"
            rules={[
              {
                required: true,
                message: t("invitation.firstNameRequired"),
              },
            ]}
          >
            <Input
              placeholder={t("invitation.firstNamePlaceholder")}
              autoComplete="given-name"
            />
          </Form.Item>

          <Form.Item
            label={t("invitation.lastName")}
            name="lastName"
            rules={[
              {
                required: true,
                message: t("invitation.lastNameRequired"),
              },
            ]}
          >
            <Input
              placeholder={t("invitation.lastNamePlaceholder")}
              autoComplete="family-name"
            />
          </Form.Item>
        </S.NameFields>

        <Form.Item
          label={t("invitation.email")}
          name="email"
          extra={t("invitation.emailHint")}
        >
          <Input disabled autoComplete="username" />
        </Form.Item>

        <Form.Item
          label={t("invitation.password")}
          name="password"
          extra={t("invitation.passwordHint")}
          rules={[
            {
              required: true,
              message: t("invitation.passwordRequired"),
            },
            {
              min: 8,
              message: t("invitation.passwordMin"),
            },
          ]}
        >
          <Input.Password
            placeholder={t("invitation.passwordPlaceholder")}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label={t("invitation.confirmPassword")}
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            {
              required: true,
              message: t("invitation.confirmPasswordRequired"),
            },
            ({ getFieldValue }) => ({
              validator(_, value: string | undefined) {
                if (!value || value === getFieldValue("password")) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error(t("invitation.passwordMismatch")),
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder={t("invitation.confirmPasswordPlaceholder")}
            autoComplete="new-password"
          />
        </Form.Item>

        <S.FormActions>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            {t("invitation.submit")}
          </Button>
        </S.FormActions>
      </Form>
    </>
  );
};
