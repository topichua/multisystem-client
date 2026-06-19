import { Alert, Button, Form, Input, Result, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { pagesMap } from "@/app/router/pages-map";
import { workspaceMembersApi } from "@/features/workspace-members/api/workspace-members-api";
import type { WorkspaceMemberRegisterInfo } from "@/features/workspace-members/model/workspace-member.types";

import * as S from "./invitation-page.styled";

type InvitationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const InvitationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm<InvitationFormValues>();
  const { token: pathToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const [inviteInfo, setInviteInfo] =
    useState<WorkspaceMemberRegisterInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const invitationHash = useMemo(
    () =>
      searchParams.get("token") ?? searchParams.get("hash") ?? pathToken ?? "",
    [pathToken, searchParams],
  );
  const displayError = invitationHash
    ? loadError
    : t("invitation.missingToken");
  const password = Form.useWatch("password", form);

  useEffect(() => {
    if (!invitationHash) {
      return;
    }

    let cancelled = false;

    const loadInvitation = async () => {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      await workspaceMembersApi
        .getRegisterInfo(invitationHash)
        .then((info) => {
          if (cancelled) {
            return;
          }

          setInviteInfo(info);
          form.setFieldsValue({
            firstName: info.first_name ?? info.firstName ?? "",
            lastName: info.last_name ?? info.lastName ?? "",
            email: info.email,
          });
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setLoadError(getApiErrorMessage(error, t("invitation.loadError")));
        })
        .finally(() => {
          if (cancelled) {
            return;
          }

          setIsLoading(false);
        });
    };

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [form, invitationHash, t]);

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

  const handleSubmit = async (values: InvitationFormValues) => {
    if (!invitationHash) {
      setLoadError(t("invitation.missingToken"));
      return;
    }

    setIsSubmitting(true);

    await workspaceMembersApi
      .register(invitationHash, {
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        password: values.password,
      })
      .then((response) => {
        if (response.registered) {
          setIsCompleted(true);
          return;
        }

        setLoadError(t("invitation.submitError"));
      })
      .catch((error) => {
        setLoadError(getApiErrorMessage(error, t("invitation.submitError")));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <S.Page>
      <S.FormSide>
        <S.InvitationCard>
          {isLoading ? (
            <S.StateCard>
              <Spin />
            </S.StateCard>
          ) : isCompleted ? (
            <Result
              status="success"
              title={t("invitation.successTitle")}
              subTitle={t("invitation.successDescription")}
              extra={
                <Link to={pagesMap.login}>
                  <Button type="primary">{t("invitation.goToLogin")}</Button>
                </Link>
              }
            />
          ) : (
            <>
              <S.Header>
                <S.PageTitle>{t("invitation.title")}</S.PageTitle>
                <S.PageDescription>
                  <Trans
                    i18nKey="invitation.description"
                    values={{
                      workspaceName:
                        inviteInfo?.workspaceName ??
                        inviteInfo?.workspace_name ??
                        t("brand"),
                    }}
                    components={{ strong: <Typography.Text strong /> }}
                  />
                </S.PageDescription>
              </S.Header>

              {displayError ? (
                <Alert
                  type="error"
                  showIcon
                  message={displayError}
                  style={{ marginBottom: 24 }}
                />
              ) : null}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                disabled={!invitationHash || !inviteInfo || isSubmitting}
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
                    {
                      validator: (_, value: string | undefined) => {
                        if (!value || value === password) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(t("invitation.passwordMismatch")),
                        );
                      },
                    },
                  ]}
                >
                  <Input.Password
                    placeholder={t("invitation.confirmPasswordPlaceholder")}
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
                    {t("invitation.submit")}
                  </Button>
                </S.FormActions>
              </Form>
            </>
          )}
        </S.InvitationCard>
      </S.FormSide>

      <S.ImageSide />
    </S.Page>
  );
};
