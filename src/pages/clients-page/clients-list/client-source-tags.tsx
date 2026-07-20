import { Flex, Tag } from "antd";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

import {
  hasClientInstagramSource,
  hasClientTelegramSource,
} from "./client-display.utils";

type ClientSourceTagsProps = {
  client: Client;
};

export function ClientSourceTags({ client }: ClientSourceTagsProps) {
  const { t } = useTranslation();
  const showInstagram = hasClientInstagramSource(client);
  const showTelegram = hasClientTelegramSource(client);

  if (!showInstagram && !showTelegram) {
    return <span>—</span>;
  }

  return (
    <Flex gap={4} wrap="wrap">
      {showInstagram && (
        <Tag style={{ margin: 0, borderRadius: 999 }}>
          {t("clients.source.instagram")}
        </Tag>
      )}
      {showTelegram && (
        <Tag style={{ margin: 0, borderRadius: 999 }}>
          {t("clients.source.telegram")}
        </Tag>
      )}
    </Flex>
  );
}
