import { ClockIcon, PlugsIcon } from "@phosphor-icons/react";
import { Avatar, Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";
import { formatDateTime } from "@/utils/date-time";

import * as S from "./settings-integrations.styled";

const { Text, Title } = Typography;

type IntegrationAccountCardProps = {
  integration: IntegrationItem;
  isDisconnecting: boolean;
  layout?: "desktop" | "mobile";
  onDisconnect: (integration: IntegrationItem) => void;
};

export function IntegrationAccountCard({
  integration,
  isDisconnecting,
  layout = "desktop",
  onDisconnect,
}: IntegrationAccountCardProps) {
  const { t } = useTranslation();
  const isMobile = layout === "mobile";

  const accountDetails = (
    <>
      <Title level={5} style={{ margin: 0 }}>
        {integration.name}
      </Title>
      {integration.userName && (
        <Text type="secondary">@{integration.userName}</Text>
      )}
      {integration.followersCount != null && (
        <Text type="secondary">
          {t("integrations.followersCount", {
            count: integration.followersCount,
          })}
        </Text>
      )}
      {integration.postsCount != null && (
        <Text type="secondary">
          {t("instagram.postsCount", {
            count: integration.postsCount,
          })}
        </Text>
      )}
    </>
  );

  const statusRow = (
    <S.MobileIntegrationAccountStatusRow>
      <S.IntegrationConnectedStatus>
        {t("integrations.connectedTag")}
      </S.IntegrationConnectedStatus>
      {integration.connectedAt && (
        <Flex align="center" gap={4}>
          <ClockIcon />
          <Text type="secondary">
            {formatDateTime(integration.connectedAt)}
          </Text>
        </Flex>
      )}
    </S.MobileIntegrationAccountStatusRow>
  );

  if (isMobile) {
    return (
      <S.MobileIntegrationAccountCard
        data-qa={`settings-mobile-integration-account-${integration.id}`}
      >
        <S.MobileIntegrationAccountMeta>
          <Avatar
            size={40}
            src={integration.avatar ?? undefined}
            alt={integration.name}
          >
            {integration.name.charAt(0).toUpperCase()}
          </Avatar>
          <S.MobileIntegrationAccountDetails>
            {accountDetails}
            {statusRow}
          </S.MobileIntegrationAccountDetails>
        </S.MobileIntegrationAccountMeta>
        <Button
          danger
          block
          loading={isDisconnecting}
          icon={<PlugsIcon />}
          data-qa={`settings-mobile-integration-disconnect-${integration.id}`}
          onClick={() => onDisconnect(integration)}
        >
          {t("integrations.disconnectAction")}
        </Button>
      </S.MobileIntegrationAccountCard>
    );
  }

  return (
    <S.IntegrationAccountRow>
      <Flex gap={16} align="center" flex={1}>
        <Avatar
          size={40}
          src={integration.avatar ?? undefined}
          alt={integration.name}
        >
          {integration.name.charAt(0).toUpperCase()}
        </Avatar>
        <Flex vertical gap={12} flex={1}>
          <Flex vertical gap={0} flex={1}>
            {accountDetails}
          </Flex>
          <Flex align="center" gap={16}>
            <S.IntegrationConnectedStatus>
              {t("integrations.connectedTag")}
            </S.IntegrationConnectedStatus>
            <Flex align="center" gap={4}>
              <ClockIcon />
              {integration.connectedAt && (
                <Text type="secondary">
                  {formatDateTime(integration.connectedAt)}
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Button
        danger
        loading={isDisconnecting}
        icon={<PlugsIcon />}
        onClick={() => onDisconnect(integration)}
      >
        {t("integrations.disconnectAction")}
      </Button>
    </S.IntegrationAccountRow>
  );
}
