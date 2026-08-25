import { Alert, Card, Divider, Empty, Flex, Switch, Typography } from "antd";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type {
  ChannelAutoDistributionIntegrationType,
  IntegrationItem,
} from "@/features/integrations/model/integration.types";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";
import { useNotification } from "@/shared/components/notification/use-notification";

const { Text, Title } = Typography;

const CHANNEL_DEFINITIONS = [
  {
    type: "instagram",
    labelKey: "automation.channels.types.instagram",
    icon: <InstagramLogoIcon size={18} />,
  },
  {
    type: "telegram",
    labelKey: "automation.channels.types.telegram",
    icon: <TelegramLogoIcon size={18} />,
  },
] as const satisfies readonly {
  type: ChannelAutoDistributionIntegrationType;
  labelKey: string;
  icon: ReactNode;
}[];

const isAutomationChannelIntegration = (
  integration: IntegrationItem,
): integration is IntegrationItem & {
  type: ChannelAutoDistributionIntegrationType;
} => integration.type === "instagram" || integration.type === "telegram";

const formatChannelName = (integration: IntegrationItem): string => {
  const userName = integration.userName?.trim();

  if (userName) {
    return userName.startsWith("@") ? userName : `@${userName}`;
  }

  return (
    integration.page?.trim() ||
    integration.displayName?.trim() ||
    integration.name.trim() ||
    String(integration.id)
  );
};

export const AutomationChannelSettings = observer(() => {
  const { t } = useTranslation();
  const notification = useNotification();
  const store = useIntegrationsStore();
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void store
      .loadIntegrations({ force: true })
      .then(() => {
        if (!cancelled) {
          setLoadError(null);
        }
      })
      .catch((error) => {
        const message = getApiErrorMessage(
          error,
          t("automation.channels.loadError"),
        );

        if (!cancelled) {
          setLoadError(message);
          notification.error({ message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [notification, store, t]);

  const handleAutoDistributionChange = async (
    type: ChannelAutoDistributionIntegrationType,
    id: number,
    enabled: boolean,
  ) => {
    try {
      await store.setChannelAutoDistribution(type, id, enabled);
    } catch (error) {
      notification.error({
        message: getApiErrorMessage(
          error,
          t("automation.channels.updateError"),
        ),
      });
    }
  };

  const channelGroups = CHANNEL_DEFINITIONS.map((definition) => ({
    ...definition,
    integrations: store.items
      .filter(isAutomationChannelIntegration)
      .filter((integration) => integration.type === definition.type),
  })).filter((group) => group.integrations.length > 0);

  const content =
    store.listLoading && store.items.length === 0 ? (
      <CenteredSpinner />
    ) : channelGroups.length === 0 ? (
      <Empty description={t("automation.channels.empty")} />
    ) : (
      <Flex vertical gap={24}>
        {channelGroups.map((group) => (
          <Flex vertical gap={8} key={group.type}>
            <Flex vertical gap={8}>
              <Flex align="center" gap={8}>
                {group.icon}
                <Title level={5}>{t(group.labelKey)}</Title>
              </Flex>
            </Flex>

            <Flex vertical style={{ minWidth: 0 }}>
              {group.integrations.map((integration, index) => (
                <div key={`${integration.type}:${integration.id}`}>
                  {index > 0 && <Divider style={{ margin: "18px 0" }} />}
                  <Flex vertical gap={8}>
                    <Text strong>{formatChannelName(integration)}</Text>

                    <Flex
                      align="center"
                      justify="space-between"
                      gap={16}
                      style={{ minWidth: 0 }}
                    >
                      <Flex vertical style={{ minWidth: 0 }}>
                        <Title level={5}>
                          {t("automation.channels.autoDistribution.title")}
                        </Title>
                        <Text type="secondary">
                          {t(
                            "automation.channels.autoDistribution.description",
                          )}
                        </Text>
                      </Flex>
                      <Flex flex="0 0 auto">
                        <Switch
                          checked={integration.chat_auto_distribution === true}
                          loading={store.isUpdatingChannelSettings(
                            integration.type,
                            integration.id,
                          )}
                          onChange={(checked) => {
                            void handleAutoDistributionChange(
                              integration.type,
                              integration.id,
                              checked,
                            );
                          }}
                          data-qa={`settings-automation-channel-auto-distribution-${integration.type}-${integration.id}`}
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </div>
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    );

  return (
    <Card data-qa="settings-automation-channels">
      <Flex vertical gap={24}>
        <Flex vertical gap={4} style={{ minWidth: 0 }}>
          <Title level={5}>{t("automation.channels.title")}</Title>
          <Text type="secondary">{t("automation.channels.description")}</Text>
        </Flex>

        {loadError ? (
          <Alert type="error" title={loadError} showIcon />
        ) : (
          content
        )}
      </Flex>
    </Card>
  );
});
