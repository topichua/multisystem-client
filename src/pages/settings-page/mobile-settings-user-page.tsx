import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button, Flex, Form, Input, Popconfirm, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { pagesMap } from "@/app/router/pages-map";
import { dataQaAttrs } from "@/styled/data-qa-attrs";

import * as MobileS from "./mobile-settings-page.styled";
import * as UserS from "./settings-user-view.styled";
import { useSettingsUserForm } from "./use-settings-user-form";

export const MobileSettingsUserPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  return (
    <MobileS.Root {...dataQaAttrs("settings-mobile-user-page")}>
      <MobileS.PageHeader>
        <MobileS.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          data-qa="settings-mobile-user-back"
          aria-label={t("userSettings.mobile.backToSettingsAria")}
          onClick={() => navigate(pagesMap.settings)}
        >
          {t("settings.title")}
        </MobileS.BackButton>

        <MobileS.HeaderCopy>
          <MobileS.PageTitle level={3}>
            {t("userSettings.title")}
          </MobileS.PageTitle>
          <MobileS.PageSubtitle>
            {t("userSettings.subtitle")}
          </MobileS.PageSubtitle>
        </MobileS.HeaderCopy>
      </MobileS.PageHeader>

      <MobileS.ScrollRegion>
        <MobileS.ContentSection>
          <UserS.MobileProfileSection>
            <UserS.ProfileIdentity>
              <UserS.ProfileAvatar
                size={56}
                name={displayName}
                src={avatarSrc}
              />
              <UserS.ProfileText>
                <UserS.ProfileName>{displayName}</UserS.ProfileName>
                {profileSubtitle && (
                  <UserS.ProfileSubtitle>
                    {profileSubtitle}
                  </UserS.ProfileSubtitle>
                )}
              </UserS.ProfileText>
            </UserS.ProfileIdentity>

            <Flex gap={8} vertical>
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
                  <Button
                    block
                    loading={avatarUploading}
                    disabled={avatarDeleting}
                  >
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
                    block
                    loading={avatarDeleting}
                    disabled={avatarUploading}
                  >
                    {t("userSettings.deletePhoto")}
                  </Button>
                </Popconfirm>
              ) : null}
            </Flex>
          </UserS.MobileProfileSection>

          <MobileS.MobileFormDivider />

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onValuesChange={markProfileDirty}
            onFinish={handleProfileSubmit}
          >
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

            <MobileS.FooterActions>
              <Button
                type="primary"
                block
                htmlType="submit"
                loading={profileSaving}
                disabled={!profileDirty}
                data-qa="settings-mobile-user-save"
              >
                {t("userSettings.saveChanges")}
              </Button>
            </MobileS.FooterActions>
          </Form>
        </MobileS.ContentSection>
      </MobileS.ScrollRegion>
    </MobileS.Root>
  );
});
