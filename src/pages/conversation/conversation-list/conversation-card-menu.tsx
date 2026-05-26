import type { MenuProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const useConversationCardMenuItems = (): MenuProps["items"] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      { key: "mute", label: t("conversations.markRead") },
      { key: "delete", label: t("conversations.delete"), danger: true },
    ],
    [t],
  );
};
