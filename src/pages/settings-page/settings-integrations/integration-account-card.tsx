import { Avatar, Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import type { IntegrationItem } from '@/features/integrations/model/integration.types';

import * as S from './settings-integrations.styled';
import { ClockIcon, PlugsIcon } from '@phosphor-icons/react';
import { formatDateTime } from '@/utils/date-time';

const { Text, Title } = Typography;

type IntegrationAccountCardProps = {
  integration: IntegrationItem;
  isDisconnecting: boolean;
  onDisconnect: (integration: IntegrationItem) => void;
};

export function IntegrationAccountCard({
  integration,
  isDisconnecting,
  onDisconnect,
}: IntegrationAccountCardProps) {
  const { t } = useTranslation();

  return (
    <S.IntegrationAccountRow>
      <Flex gap={16} align="center" flex={1}>
        {integration.avatar && (
          <Avatar size={40} src={integration.avatar} alt={integration.name} />
        )}
        <Flex vertical gap={12} flex={1}>
          <Flex vertical gap={0} flex={1}>
            <Title level={5} style={{ margin: 0 }}>
              {integration.name}
            </Title>
            {integration.businessAccountId && (
              <Text>
                <Text type="secondary">Instagram Business ID:</Text>{' '}
                {integration.businessAccountId}
              </Text>
            )}
            {integration.page && (
              <Text>
                <Text type="secondary">Page:</Text> {integration.page}
              </Text>
            )}
          </Flex>
          <Flex align="center" gap={16}>
            <S.IntegrationConnectedStatus>
              {t('integrations.connectedTag')}
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
        {t('integrations.disconnectAction')}
      </Button>
    </S.IntegrationAccountRow>
  );
}
