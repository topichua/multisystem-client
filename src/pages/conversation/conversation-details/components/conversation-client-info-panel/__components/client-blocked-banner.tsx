import { LockIcon, LockOpenIcon } from "@phosphor-icons/react";
import { Avatar, Button, Card, Flex, Typography, theme } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { useNotification } from "@/shared/components/notification/use-notification";

const { Text } = Typography;

type ClientBlockedBannerProps = {
  client: Client;
  onClientUpdated: (client: Client) => void;
};

export function ClientBlockedBanner({
  client,
  onClientUpdated,
}: ClientBlockedBannerProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const clientsStore = useClientsStore();
  const notification = useNotification();
  const [loading, setLoading] = useState(false);

  const handleUnblock = useCallback(async () => {
    setLoading(true);

    try {
      await clientsStore.setClientBlocked(client.id, false);
      onClientUpdated({ ...client, blocked: false });
      notification.success({ title: t("clients.unblockSuccess") });
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("clients.unblockFailed")),
      });
    } finally {
      setLoading(false);
    }
  }, [client, clientsStore, notification, onClientUpdated, t]);

  if (!client.blocked) {
    return null;
  }

  return (
    <Card
      size="small"
      styles={{
        body: {
          padding: 14,
        },
      }}
      style={{
        marginBottom: 16,
        borderColor: token.colorErrorBorder,
        background: token.colorErrorBg,
      }}
    >
      <Flex vertical gap={12}>
        <Flex align="flex-start" gap={12}>
          <Avatar
            size={36}
            style={{
              flexShrink: 0,
              background: token.colorError,
              color: token.colorTextLightSolid,
            }}
            icon={<LockIcon size={16} weight="bold" />}
          />
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            <Text strong>{t("conversation.clientProfile.blockedTitle")}</Text>
            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.45 }}>
              {t("conversation.clientProfile.blockedDescription")}
            </Text>
          </Flex>
        </Flex>

        <Button
          block
          loading={loading || clientsStore.blockLoadingId === client.id}
          icon={<LockOpenIcon size={16} />}
          onClick={() => {
            void handleUnblock();
          }}
        >
          {t("clients.unblock")}
        </Button>
      </Flex>
    </Card>
  );
}
