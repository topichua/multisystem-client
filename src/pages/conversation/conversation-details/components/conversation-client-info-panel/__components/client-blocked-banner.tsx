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
  layout?: "vertical" | "horizontal";
  title?: string;
  description?: string;
};

export function ClientBlockedBanner({
  client,
  onClientUpdated,
  layout = "vertical",
  title,
  description,
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

  const bannerTitle = title ?? t("conversation.clientProfile.blockedTitle");
  const bannerDescription =
    description ?? t("conversation.clientProfile.blockedDescription");
  const unblockLoading = loading || clientsStore.blockLoadingId === client.id;

  const icon = (
    <Avatar
      size={36}
      style={{
        flexShrink: 0,
        background:
          layout === "horizontal" ? token.colorErrorBgHover : token.colorError,
        color:
          layout === "horizontal"
            ? token.colorError
            : token.colorTextLightSolid,
      }}
      icon={<LockIcon size={16} weight="bold" />}
    />
  );

  const copy = (
    <Flex vertical gap={2} style={{ minWidth: 0 }}>
      <Text strong>{bannerTitle}</Text>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.45 }}>
        {bannerDescription}
      </Text>
    </Flex>
  );

  const unblockButton = (
    <Button
      type={layout === "horizontal" ? "text" : "default"}
      block={layout === "vertical"}
      loading={unblockLoading}
      icon={<LockOpenIcon size={16} />}
      onClick={() => {
        void handleUnblock();
      }}
    >
      {t("clients.unblock")}
    </Button>
  );

  return (
    <Card
      size="small"
      styles={{
        body: {
          padding: 14,
        },
      }}
      style={{
        marginBottom: layout === "vertical" ? 16 : undefined,
        borderColor: token.colorErrorBorder,
        background: token.colorErrorBg,
      }}
    >
      {layout === "horizontal" ? (
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Flex align="flex-start" gap={12} style={{ minWidth: 0, flex: 1 }}>
            {icon}
            {copy}
          </Flex>
          {unblockButton}
        </Flex>
      ) : (
        <Flex vertical gap={12}>
          <Flex align="flex-start" gap={12}>
            {icon}
            {copy}
          </Flex>
          {unblockButton}
        </Flex>
      )}
    </Card>
  );
}
