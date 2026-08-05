import { UserPlusIcon } from "@phosphor-icons/react";
import { Flex, Tooltip, theme } from "antd";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import type { Client } from "@/features/clients/model/client.types";

import {
  hasClientInstagramSource,
  hasClientManualSource,
  hasClientTelegramSource,
} from "./client-display.utils";

type ClientSourceTagsProps = {
  client: Client;
};

export function ClientSourceTags({ client }: ClientSourceTagsProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const showInstagram = hasClientInstagramSource(client);
  const showTelegram = hasClientTelegramSource(client);
  const showManual = hasClientManualSource(client);

  return (
    <Flex align="center" gap={8}>
      {showManual && (
        <Tooltip title={t("clients.source.manual")}>
          <span
            aria-label={t("clients.source.manual")}
            style={{ display: "inline-flex", color: token.colorTextSecondary }}
          >
            <UserPlusIcon size={18} />
          </span>
        </Tooltip>
      )}
      {showInstagram && (
        <Tooltip title={t("clients.source.instagram")}>
          <span
            aria-label={t("clients.source.instagram")}
            style={{ display: "inline-flex" }}
          >
            <InstagramLogoIcon size={18} />
          </span>
        </Tooltip>
      )}
      {showTelegram && (
        <Tooltip title={t("clients.source.telegram")}>
          <span
            aria-label={t("clients.source.telegram")}
            style={{ display: "inline-flex" }}
          >
            <TelegramLogoIcon size={18} />
          </span>
        </Tooltip>
      )}
    </Flex>
  );
}
