import { Flex, List, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";

import { isVipClient, renderClientMeta } from "../../orders-new.utils";

const { Text } = Typography;

type ClientSearchListItemProps = {
  client: Client;
  onSelect: (client: Client) => void;
};

export function ClientSearchListItem({
  client,
  onSelect,
}: ClientSearchListItemProps) {
  const { t } = useTranslation();

  return (
    <List.Item onClick={() => onSelect(client)}>
      <List.Item.Meta
        avatar={
          <UserAvatar
            size={42}
            name={formatClientDisplayName(client)}
            src={client.avatar_src}
          />
        }
        title={
          <Flex align="center" gap={8}>
            <Text strong ellipsis>
              {formatClientDisplayName(client)}
            </Text>

            {isVipClient(client) && (
              <Tag color="gold">{t("orders.create.client.vip")}</Tag>
            )}
          </Flex>
        }
        description={renderClientMeta(client)}
      />
    </List.Item>
  );
}
