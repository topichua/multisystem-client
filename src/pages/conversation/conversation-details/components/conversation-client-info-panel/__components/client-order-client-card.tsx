import type { ReactNode } from "react";
import { Avatar, Card, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

const { Text } = Typography;

type ClientOrderClientCardProps = {
  clientPic?: string;
  linkedClient: Client;
  title: ReactNode;
};

export function ClientOrderClientCard({
  clientPic,
  linkedClient,
  title,
}: ClientOrderClientCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      size="small"
      title={title}
      styles={{
        root: {
          borderColor: "#e2e1e1",
        },
        header: {
          borderColor: "#e2e1e1",
        },
      }}
    >
      <Flex align="center" gap={16}>
        <Avatar size={48} src={clientPic}>
          {linkedClient.firstName?.[0]}
        </Avatar>
        <Flex vertical>
          <Text>
            <Text type="secondary">
              {t("conversation.clientOrders.drawer.labelName")}{" "}
            </Text>
            {linkedClient.firstName} {linkedClient.lastName}
          </Text>
          <Text>
            <Text type="secondary">
              {t("conversation.clientOrders.drawer.labelPhone")}{" "}
            </Text>
            {linkedClient.phone || "-"}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
