import type { Client } from "@/features/clients/model/client.types";
import { Flex, Space, Typography } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

type ClientOrdersInfoBlockProps = {
  linkedClient: Client;
  renderParticipantPhoto: (flush?: boolean) => React.ReactElement | null;
};

export const ClientOrdersInfoBlock = ({
  linkedClient,
  renderParticipantPhoto,
}: ClientOrdersInfoBlockProps) => {
  const { t } = useTranslation();

  return (
    <Flex align="center" gap={12}>
      {renderParticipantPhoto(true)}
      <Flex gap={2} vertical>
        <Space align="center" size="small" separator="·">
          <Text>
            {linkedClient.firstName} {linkedClient.lastName}
          </Text>
          <Text>{linkedClient.phone}</Text>
        </Space>
        <Text>
          {t("conversation.clientOrders.delivery")}:{" "}
          <Text italic type="secondary">
            {linkedClient.deliveryInfo}
          </Text>
        </Text>
        <Text>
          {t("conversation.clientOrders.clientSince")}:{" "}
          <Text italic type="secondary">
            {dayjs(linkedClient.createdAt).format("DD.MM.YYYY")}
          </Text>
        </Text>
      </Flex>
    </Flex>
  );
};
