import { ArrowLeftIcon, PhoneIcon } from "@phosphor-icons/react";
import { Button, Flex, Skeleton, Space, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { UserAvatar } from "@/components/user-avatar";

import {
  formatClientDisplayName,
  formatClientDate,
  hasClientInstagramSource,
  hasClientTelegramSource,
} from "../../clients-list/client-display.utils";

const { Title, Text } = Typography;

type ClientDetailsHeaderProps = {
  client: Client | null;
  loading: boolean;
  onBack: () => void;
};

function ClientSourceTags({ client }: { client: Client }) {
  const { t } = useTranslation();
  const instagramId = client.instagramUserIds[0];
  const telegramId = client.telegramUserIds[0];

  return (
    <>
      {hasClientInstagramSource(client) ? (
        <Tag
          icon={<InstagramLogoIcon size={14} />}
          style={{ marginInlineEnd: 0 }}
        >
          {t("clients.source.instagram")}
          {instagramId ? ` · ${instagramId}` : ""}
        </Tag>
      ) : null}
      {hasClientTelegramSource(client) ? (
        <Tag style={{ marginInlineEnd: 0 }}>
          {t("clients.source.telegram")}
          {telegramId ? ` · ${telegramId}` : ""}
        </Tag>
      ) : null}
    </>
  );
}

export function ClientDetailsHeader({
  client,
  loading,
  onBack,
}: ClientDetailsHeaderProps) {
  const { t } = useTranslation();
  const displayName = client ? formatClientDisplayName(client) : "—";
  const phone = client?.phone?.trim();

  return (
    <PaneDetailLayout.Header data-qa="layout-client-details-header">
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
        <Flex align="center" gap={16} style={{ minWidth: 0, flex: 1 }}>
          <Button
            type="text"
            aria-label={t("clients.details.backToClientsAria")}
            data-qa="clients-detail-back"
            icon={<ArrowLeftIcon size={24} />}
            onClick={onBack}
          />

          {loading && !client ? (
            <Skeleton.Avatar active size={64} />
          ) : (
            <UserAvatar size={64} name={displayName} src={client?.avatar_src} />
          )}

          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            {loading && !client ? (
              <>
                <Skeleton.Input active size="small" style={{ width: 220 }} />
                <Skeleton.Input active size="small" style={{ width: 280 }} />
              </>
            ) : (
              <>
                <Title level={3} style={{ margin: 0 }} ellipsis>
                  {displayName}
                </Title>

                <Space wrap size={[12, 8]}>
                  {phone && (
                    <Space size={6}>
                      <PhoneIcon size={16} />
                      <Text>{phone}</Text>
                    </Space>
                  )}
                  {client && <ClientSourceTags client={client} />}
                </Space>

                {client && client.createdAt && (
                  <Text type="secondary">
                    {t("clients.details.clientSince", {
                      date: formatClientDate(client.createdAt),
                    })}
                  </Text>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Flex>
    </PaneDetailLayout.Header>
  );
}
