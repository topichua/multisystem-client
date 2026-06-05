import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Flex,
  Space,
  Tag,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";

type IntegrationAccountCardProps = {
  icon: React.ReactNode;
  integration: IntegrationItem;
  isDisconnecting: boolean;
  onDisconnect: (integration: IntegrationItem) => void;
};

export function IntegrationAccountCard({
  icon,
  integration,
  isDisconnecting,
  onDisconnect,
}: IntegrationAccountCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
      size="small"
    >
      <Flex align="center" justify="space-between" gap={16}>
        <Space size={12}>
          <Avatar icon={icon} />
          <div>
            <Space size={8} wrap>
              <Typography.Text strong>{integration.name}</Typography.Text>
              <Tag color="success">{t("integrations.connectedTag")}</Tag>
            </Space>
            <Flex gap={32} wrap="wrap">
              <Typography.Text type="secondary">
                {t("integrations.typeLabel", {
                  type: integration.type,
                })}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t("integrations.addedLabel", {
                  date: integration.connectedAt,
                })}
              </Typography.Text>
            </Flex>
          </div>
        </Space>
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "disconnect",
                label: t("integrations.disconnectAction"),
                danger: true,
                disabled: isDisconnecting,
              },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === "disconnect") {
                onDisconnect(integration);
              }
            },
          }}
        >
          <Button
            type="text"
            icon={<DotsThreeVerticalIcon />}
            loading={isDisconnecting}
          />
        </Dropdown>
      </Flex>
    </Card>
  );
}
