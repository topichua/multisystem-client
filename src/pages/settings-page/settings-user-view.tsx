import { Button, Form, Input, Typography, Upload, message } from "antd";
import type { UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { FormCard, FormDivider } from "@/components/layout/form-card.styled";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";
import { authApi } from "@/features/auth/api/auth-api";
import type { AuthUserRole } from "@/features/auth/model/auth-session.types";
import { useUserStore } from "@/features/auth/model/use-user-store";

import * as S from "./settings-user-view.styled";

const { Title } = Typography;

type UserSettingsFormValues = {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
};

function getRoleLabel(t: TFunction, role: AuthUserRole | null): string {
  if (!role) {
    return "";
  }

  const key = `userSettings.roles.${role}`;
  return t(key, { defaultValue: role });
}

function getPhoneFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string {
  const phone = metadata?.phone;
  return typeof phone === "string" ? phone : "";
}

export const SettingsUserView = observer(() => {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<UserSettingsFormValues>();
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const displayName = userStore.displayName ?? t("profile.user");
  const avatarSrc = userStore.user?.avatar_src ?? undefined;
  const companyName = userStore.company?.name;
  const roleLabel = getRoleLabel(t, userStore.role);
  const profileSubtitle = companyName
    ? t("userSettings.profileSubtitle", {
        role: roleLabel,
        company: companyName,
      })
    : roleLabel;

  useEffect(() => {
    const user = userStore.user;
    if (!user) {
      return;
    }

    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      phone: getPhoneFromMetadata(user.metadata),
      email: user.email,
    });
  }, [form, userStore.user]);

  const handleProfileSubmit = useCallback(
    async (values: UserSettingsFormValues) => {
      setProfileSaving(true);

      try {
        await authApi.updateProfile({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone?.trim() || undefined,
        });
        await userStore.loadAuth();
        messageApi.success(t("userSettings.profileUpdateSuccess"));
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t("userSettings.profileUpdateError")),
        );
      } finally {
        setProfileSaving(false);
      }
    },
    [messageApi, t, userStore],
  );

  const handleAvatarBeforeUpload: UploadProps["beforeUpload"] = useCallback(
    (file) => {
      setAvatarUploading(true);

      void authApi
        .updateAvatar(file)
        .then(() => userStore.loadAuth())
        .then(() => {
          messageApi.success(t("userSettings.avatarUpdateSuccess"));
        })
        .catch((error) => {
          messageApi.error(
            getApiErrorMessage(error, t("userSettings.avatarUpdateError")),
          );
        })
        .finally(() => {
          setAvatarUploading(false);
        });

      return Upload.LIST_IGNORE;
    },
    [messageApi, t, userStore],
  );

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset data-qa="layout-settings-user">
        <PaneDetailLayout.Header data-qa="layout-settings-user-header">
          <Title level={4} style={{ marginTop: 0 }}>
            {t("userSettings.title")}
          </Title>
          <PaneSectionHint style={{ marginTop: 0 }}>
            {t("userSettings.subtitle")}
          </PaneSectionHint>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-settings-user-body">
          <FormCard>
            <S.ProfileRow>
              <S.ProfileIdentity>
                <S.ProfileAvatar size={56} name={displayName} src={avatarSrc} />
                <S.ProfileText>
                  <S.ProfileName>{displayName}</S.ProfileName>
                  {profileSubtitle ? (
                    <S.ProfileSubtitle>{profileSubtitle}</S.ProfileSubtitle>
                  ) : null}
                </S.ProfileText>
              </S.ProfileIdentity>
              <ImgCrop
                aspect={1}
                cropShape="round"
                modalCancel={t("userSettings.cropAvatarCancel")}
                modalOk={t("userSettings.cropAvatarOk")}
                modalTitle={t("userSettings.cropAvatarTitle")}
                quality={0.9}
                rotationSlider
                showReset
              >
                <Upload
                  accept="image/*"
                  beforeUpload={handleAvatarBeforeUpload}
                  disabled={avatarUploading}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button loading={avatarUploading}>
                    {t("userSettings.changePhoto")}
                  </Button>
                </Upload>
              </ImgCrop>
            </S.ProfileRow>

            <FormDivider />

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleProfileSubmit}
            >
              <S.FormGrid>
                <Form.Item
                  name="firstName"
                  label={t("userSettings.firstName")}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t("userSettings.firstNameRequired"),
                    },
                  ]}
                >
                  <Input autoComplete="given-name" />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label={t("userSettings.lastName")}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t("userSettings.lastNameRequired"),
                    },
                  ]}
                >
                  <Input autoComplete="family-name" />
                </Form.Item>
                <Form.Item name="email" label={t("userSettings.email")}>
                  <Input autoComplete="email" disabled />
                </Form.Item>
                <Form.Item name="phone" label={t("userSettings.phone")}>
                  <ClientPhoneFormInput
                    autoComplete="tel"
                    placeholder={t("userSettings.phonePlaceholder")}
                  />
                </Form.Item>
                <Form.Item label={t("userSettings.role")}>
                  <Input disabled value={roleLabel} />
                </Form.Item>
              </S.FormGrid>

              <FormDivider />

              <S.FormFooter>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={profileSaving}
                >
                  {t("userSettings.saveChanges")}
                </Button>
              </S.FormFooter>
            </Form>
          </FormCard>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
