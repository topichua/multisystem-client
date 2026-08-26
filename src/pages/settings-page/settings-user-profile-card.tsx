import { Button, Flex, Form, Input, Popconfirm, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { FormCard, FormDivider } from "@/components/layout/form-card";
import { emailFieldRules } from "@/utils/email-input";
import { phoneFieldRules } from "@/utils/phone-input";

import * as S from "./settings-user-view.styled";
import { useSettingsUserForm } from "./use-settings-user-form";

export const SettingsUserProfileCard = observer(() => {
  const { t } = useTranslation();
  const {
    form,
    displayName,
    avatarSrc,
    profileSubtitle,
    roleLabel,
    profileSaving,
    profileDirty,
    avatarUploading,
    avatarDeleting,
    markProfileDirty,
    handleProfileSubmit,
    handleAvatarBeforeUpload,
    handleAvatarDelete,
  } = useSettingsUserForm();
  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        required: false,
        invalidMessage: t("userSettings.phoneInvalid"),
      }),
    [t],
  );
  const emailRules = useMemo(
    () =>
      emailFieldRules({
        requiredMessage: t("userSettings.emailRequired"),
        invalidMessage: t("userSettings.emailInvalid"),
      }),
    [t],
  );

  return (
    <FormCard>
      <S.ProfileRow>
        <S.ProfileIdentity>
          <S.ProfileAvatar size={56} name={displayName} src={avatarSrc} />
          <S.ProfileText>
            <S.ProfileName>{displayName}</S.ProfileName>
            {profileSubtitle && (
              <S.ProfileSubtitle>{profileSubtitle}</S.ProfileSubtitle>
            )}
          </S.ProfileText>
        </S.ProfileIdentity>
        <Flex gap={8} align="center" wrap="wrap">
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
              disabled={avatarUploading || avatarDeleting}
              maxCount={1}
              showUploadList={false}
            >
              <Button loading={avatarUploading} disabled={avatarDeleting}>
                {t("userSettings.changePhoto")}
              </Button>
            </Upload>
          </ImgCrop>
          {avatarSrc ? (
            <Popconfirm
              title={t("userSettings.deletePhotoConfirmTitle")}
              okText={t("userSettings.deletePhoto")}
              okButtonProps={{ danger: true }}
              onConfirm={() => void handleAvatarDelete()}
            >
              <Button
                danger
                loading={avatarDeleting}
                disabled={avatarUploading}
              >
                {t("userSettings.deletePhoto")}
              </Button>
            </Popconfirm>
          ) : null}
        </Flex>
      </S.ProfileRow>

      <FormDivider />

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onValuesChange={markProfileDirty}
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
          <Form.Item
            name="email"
            label={t("userSettings.email")}
            rules={emailRules}
          >
            <Input autoComplete="email" disabled />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t("userSettings.phone")}
            rules={phoneRules}
          >
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
            disabled={!profileDirty}
          >
            {t("userSettings.saveChanges")}
          </Button>
        </S.FormFooter>
      </Form>
    </FormCard>
  );
});
