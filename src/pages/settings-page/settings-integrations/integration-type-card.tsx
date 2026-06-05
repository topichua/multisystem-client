import { PlusIcon } from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";

import type {
  IntegrationDefinition,
  IntegrationType,
} from "./settings-integrations.definitions";
import { IntegrationAccountCard } from "./integration-account-card";

type IntegrationTypeCardProps = {
  connectLoading: boolean;
  definition: IntegrationDefinition;
  integrations: IntegrationItem[];
  isDisconnecting: (type: IntegrationItem["type"], id: number) => boolean;
  onConnectType: (type: IntegrationType) => void;
  onDisconnect: (integration: IntegrationItem) => void;
};

export function IntegrationTypeCard({
  connectLoading,
  definition,
  integrations,
  isDisconnecting,
  onConnectType,
  onDisconnect,
}: IntegrationTypeCardProps) {
  const { t } = useTranslation();

  return (
    <Card key={definition.type}>
      <Flex align="center" justify="space-between" gap={16}>
        <Space size={16}>
          <Avatar size={40} shape="square" icon={definition.icon} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t(definition.labelKey)}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t(definition.descriptionKey)}
            </Typography.Text>
          </div>
        </Space>
        <Button
          icon={<PlusIcon />}
          loading={connectLoading}
          onClick={() => onConnectType(definition.type)}
        >
          {t(definition.connectLabelKey)}
        </Button>
      </Flex>

      <Divider />

      {integrations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t(definition.emptyKey)}
        />
      ) : (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {integrations.map((integration) => (
            <IntegrationAccountCard
              key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
              icon={definition.icon}
              integration={integration}
              isDisconnecting={isDisconnecting(
                integration.type,
                integration.id,
              )}
              onDisconnect={onDisconnect}
            />
          ))}
        </Space>
      )}
    </Card>
  );
}
