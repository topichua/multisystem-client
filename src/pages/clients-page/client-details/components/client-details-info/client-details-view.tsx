import { PencilSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { Button, Flex, Space, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import { formatDate } from "@/utils/date-time";

import { formatClientDisplayName } from "../../../clients-list/client-display.utils";
import {
  blockedTagStyle,
  growStyle,
  shrinkStyle,
  titleRowStyle,
  titleStyle,
} from "./client-details-info.shared";
import { ClientSourceTags } from "./client-source-tags";

const { Title, Text } = Typography;

type ClientDetailsViewProps = {
  client: Client;
  canEdit: boolean;
  onEdit: () => void;
};

export function ClientDetailsView({
  client,
  canEdit,
  onEdit,
}: ClientDetailsViewProps) {
  const { t } = useTranslation();
  const displayName = formatClientDisplayName(client);
  const phone = client.phone?.trim();

  return (
    <Flex align="center" gap={16} style={growStyle}>
      <UserAvatar size={64} name={displayName} src={client.avatar_src} />

      <Flex vertical gap={2} style={growStyle}>
        <Flex align="center" gap={8} style={titleRowStyle}>
          <Title level={3} style={titleStyle} ellipsis>
            {displayName}
          </Title>

          {client.blocked && (
            <Tag color="red" style={blockedTagStyle}>
              {t("clients.blockedBadge")}
            </Tag>
          )}

          {canEdit && (
            <Button
              type="text"
              size="small"
              aria-label={t("clients.details.editAria")}
              data-qa="clients-detail-edit"
              icon={<PencilSimpleIcon size={18} />}
              style={shrinkStyle}
              onClick={onEdit}
            />
          )}
        </Flex>

        <Flex vertical gap={6} align="flex-start">
          {phone && (
            <Space size={6}>
              <PhoneIcon size={16} />
              <Text>{phone}</Text>
            </Space>
          )}

          <ClientSourceTags client={client} />
        </Flex>

        {client.createdAt && (
          <Text type="secondary">
            {t("clients.details.clientSince", {
              date: formatDate(client.createdAt) || "—",
            })}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
