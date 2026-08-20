import type { UploadProps } from "antd";
import { Form, Upload } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { authApi } from "@/features/auth/api/auth-api";
import type { AuthUserRole } from "@/features/auth/model/auth-session.types";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { useNotification } from "@/shared/components/notification/use-notification";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";

export type UserSettingsFormValues = {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
};

export type ChangeEmailFormValues = {
  newEmail: string;
  existingPassword: string;
};

export type ChangePasswordFormValues = {
  existingPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function getRoleLabel(t: TFunction, role: AuthUserRole | null): string {
  if (!role) {
    return "";
  }

  const key = `userSettings.roles.${role}`;
  return t(key, { defaultValue: role });
}

export function useSettingsUserForm() {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const notification = useNotification();
  const [form] = Form.useForm<UserSettingsFormValues>();
  const [emailForm] = Form.useForm<ChangeEmailFormValues>();
  const [passwordForm] = Form.useForm<ChangePasswordFormValues>();
  const [profileSaving, setProfileSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
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
      phone: user.phone ? normalizeClientPhoneForInput(user.phone) : "",
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
        notification.success({ title: t("userSettings.profileUpdateSuccess") });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("userSettings.profileUpdateError"),
          ),
        });
      } finally {
        setProfileSaving(false);
      }
    },
    [notification, t, userStore],
  );

  const handleAvatarBeforeUpload: UploadProps["beforeUpload"] = useCallback(
    (file) => {
      setAvatarUploading(true);

      void authApi
        .updateAvatar(file)
        .then(() => userStore.loadAuth())
        .then(() => {
          notification.success({
            title: t("userSettings.avatarUpdateSuccess"),
          });
        })
        .catch((error) => {
          notification.error({
            title: getApiErrorMessage(
              error,
              t("userSettings.avatarUpdateError"),
            ),
          });
        })
        .finally(() => {
          setAvatarUploading(false);
        });

      return Upload.LIST_IGNORE;
    },
    [notification, t, userStore],
  );

  const handleEmailSubmit = useCallback(
    async (values: ChangeEmailFormValues) => {
      setEmailSaving(true);

      try {
        await authApi.setEmail({
          new_email: values.newEmail.trim(),
          existing_password: values.existingPassword,
        });
        await userStore.loadAuth();
        emailForm.resetFields();
        notification.success({ title: t("userSettings.emailUpdateSuccess") });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("userSettings.emailUpdateError")),
        });
      } finally {
        setEmailSaving(false);
      }
    },
    [emailForm, notification, t, userStore],
  );

  const handlePasswordSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      setPasswordSaving(true);

      try {
        await authApi.changePassword({
          existing_password: values.existingPassword,
          new_password: values.newPassword,
        });
        passwordForm.resetFields();
        notification.success({
          title: t("userSettings.passwordUpdateSuccess"),
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("userSettings.passwordUpdateError"),
          ),
        });
      } finally {
        setPasswordSaving(false);
      }
    },
    [notification, passwordForm, t],
  );

  return {
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
  };
}
