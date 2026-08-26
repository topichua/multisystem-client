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
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);

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

  const markProfileDirty = useCallback(() => {
    setProfileDirty(true);
  }, []);

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
        setProfileDirty(false);
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

  const handleAvatarDelete = useCallback(async () => {
    setAvatarDeleting(true);

    try {
      await authApi.deleteAvatar();
      await userStore.loadAuth();
      notification.success({
        title: t("userSettings.avatarDeleteSuccess"),
      });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("userSettings.avatarDeleteError")),
      });
    } finally {
      setAvatarDeleting(false);
    }
  }, [notification, t, userStore]);

  return {
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
  };
}
