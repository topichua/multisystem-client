import { Button, Form, Input, Typography, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { FormCard, FormDivider } from "@/components/layout/form-card";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";

import * as S from "./settings-user-view.styled";
import { useSettingsUserForm } from "./use-settings-user-form";

const { Title } = Typography;

export const SettingsUserView = observer(() => {
  const { t } = useTranslation();
  const {
    form,
    emailForm,
    passwordForm,
    displayName,
    avatarSrc,
    profileSubtitle,
    roleLabel,
    profileSaving,
    emailSaving,
    passwordSaving,
    avatarUploading,
    handleProfileSubmit,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleAvatarBeforeUpload,
  } = useSettingsUserForm();

  return (
    <>
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
          <S.CardsStack>
            <FormCard>
              <S.ProfileRow>
                <S.ProfileIdentity>
                  <S.ProfileAvatar
                    size={56}
                    name={displayName}
                    src={avatarSrc}
                  />
                  <S.ProfileText>
                    <S.ProfileName>{displayName}</S.ProfileName>
                    {profileSubtitle && (
                      <S.ProfileSubtitle>{profileSubtitle}</S.ProfileSubtitle>
                    )}
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

            <FormCard>
              <S.FormSectionTitle level={5}>
                {t("userSettings.changeEmailTitle")}
              </S.FormSectionTitle>

              <Form
                form={emailForm}
                layout="vertical"
                requiredMark={false}
                onFinish={handleEmailSubmit}
              >
                <S.FormGrid>
                  <Form.Item
                    name="newEmail"
                    label={t("userSettings.newEmail")}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: t("userSettings.newEmailRequired"),
                      },
                      {
                        type: "email",
                        message: t("userSettings.newEmailInvalid"),
                      },
                    ]}
                  >
                    <Input autoComplete="email" />
                  </Form.Item>
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
                </S.FormGrid>

                <FormDivider />

                <S.FormFooter>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={emailSaving}
                  >
                    {t("userSettings.saveEmail")}
                  </Button>
                </S.FormFooter>
              </Form>
            </FormCard>

            <FormCard>
              <S.FormSectionTitle level={5}>
                {t("userSettings.changePasswordTitle")}
              </S.FormSectionTitle>

              <Form
                form={passwordForm}
                layout="vertical"
                requiredMark={false}
                onFinish={handlePasswordSubmit}
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
                          if (
                            !value ||
                            value === getFieldValue("newPassword")
                          ) {
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
                    loading={passwordSaving}
                  >
                    {t("userSettings.savePassword")}
                  </Button>
                </S.FormFooter>
              </Form>
            </FormCard>
          </S.CardsStack>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
