import { Button, Form, Input, Typography, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { FormCard, FormDivider } from "@/components/layout/form-card.styled";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionHint } from "@/components/layout/pane-frame";

import * as S from "./settings-user-view.styled";
import { useSettingsUserForm } from "./use-settings-user-form";

const { Title } = Typography;

export const SettingsUserView = observer(() => {
  const { t } = useTranslation();
  const {
    form,
    displayName,
    avatarSrc,
    profileSubtitle,
    roleLabel,
    profileSaving,
    avatarUploading,
    handleProfileSubmit,
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
