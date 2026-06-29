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

function getPhoneFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string {
  const phone = metadata?.phone;
  return typeof phone === "string" ? phone : "";
}

export function useSettingsUserForm() {
  const { t } = useTranslation();
  const userStore = useUserStore();
  const notification = useNotification();
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

  return {
    form,
    displayName,
    avatarSrc,
    profileSubtitle,
    roleLabel,
    profileSaving,
    avatarUploading,
    handleProfileSubmit,
    handleAvatarBeforeUpload,
  };
}
