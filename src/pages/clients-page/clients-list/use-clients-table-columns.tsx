import {
  LockIcon,
  LockOpenIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Badge, Button, Flex, Modal, Tag, Tooltip, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import type { Client } from "@/features/clients/model/client.types";
import { formatDateTimeNumeric } from "@/utils/date-time";

import {
  formatClientDisplayName,
  formatClientSocialUsernames,
  formatClientUahAmount,
  getClientOrderStats,
} from "./client-display.utils";
import { ClientSourceTags } from "./client-source-tags";

const { Text } = Typography;

type UseClientsTableColumnsParams = {
  blockLoadingId: number | null;
  deleteLoadingId: number | null;
  onDelete: (id: number) => Promise<void>;
  onEdit: (client: Client) => void;
  onToggleBlock: (client: Client) => Promise<void>;
};

export function useClientsTableColumns({
  blockLoadingId,
  deleteLoadingId,
  onDelete,
  onEdit,
  onToggleBlock,
}: UseClientsTableColumnsParams): TableColumnsType<Client> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: t("clients.table.client"),
        key: "client",
        render: (_, client) => {
          const displayName = formatClientDisplayName(client);

          return (
            <Flex align="center" gap={12} style={{ minWidth: 0 }}>
              <UserAvatar
                size={40}
                name={displayName}
                src={client.avatar_src}
                style={{ flexShrink: 0 }}
              />
              <Flex vertical gap={4}>
                <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                  <Text strong ellipsis style={{ minWidth: 0 }}>
                    {displayName}
                  </Text>
                  {client.blocked && (
                    <Tag
                      color="red"
                      style={{ marginInlineEnd: 0, flexShrink: 0 }}
                    >
                      {t("clients.blockedBadge")}
                    </Tag>
                  )}
                </Flex>
                <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                  {formatClientSocialUsernames(client) || "—"}
                </Text>
              </Flex>
            </Flex>
          );
        },
      },
      {
        title: t("clients.table.contacts"),
        key: "contacts",
        width: 160,
        render: (_, client) => (
          <Text style={{ whiteSpace: "nowrap" }}>
            {client.phone?.trim() || "—"}
          </Text>
        ),
      },
      {
        title: t("clients.table.source"),
        key: "source",
        width: 130,
        render: (_, client) => <ClientSourceTags client={client} />,
      },
      {
        title: t("clients.table.orders"),
        key: "orders",
        width: 130,
        render: (_, client) => {
          const orderCount = getClientOrderStats(client)?.orderCount ?? 0;

          return <Badge count={orderCount} color={"mediumpurple"} showZero />;
        },
      },
      {
        title: t("clients.table.totalSpent"),
        key: "totalSpent",
        width: 150,
        render: (_, client) => (
          <Text strong>
            {formatClientUahAmount(getClientOrderStats(client)?.totalSpent)}
          </Text>
        ),
      },
      {
        title: t("clients.table.createdAt"),
        key: "createdAt",
        width: 170,
        render: (_, client) => (
          <Text>{formatDateTimeNumeric(client.createdAt) || "—"}</Text>
        ),
      },
      {
        title: t("clients.table.lastOrder"),
        key: "lastOrder",
        width: 170,
        render: (_, client) => (
          <Text>
            {formatDateTimeNumeric(
              getClientOrderStats(client)?.lastOrderAt ?? "",
            ) || "—"}
          </Text>
        ),
      },
      {
        title: t("clients.tableActions"),
        key: "actions",
        width: 150,
        fixed: "right",
        render: (_, client) => {
          const blockLabel = client.blocked
            ? t("clients.unblock")
            : t("clients.block");

          return (
            <Flex
              align="center"
              gap={4}
              data-qa={`clients-list-actions-${client.id}`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Tooltip title={t("clients.edit")}>
                <Button
                  type="text"
                  size="small"
                  icon={<PencilSimpleIcon size={16} />}
                  aria-label={t("clients.edit")}
                  onClick={() => onEdit(client)}
                />
              </Tooltip>
              <Tooltip title={blockLabel}>
                <Button
                  type="text"
                  size="small"
                  danger={client.blocked}
                  loading={blockLoadingId === client.id}
                  icon={
                    client.blocked ? (
                      <LockIcon size={16} />
                    ) : (
                      <LockOpenIcon size={16} />
                    )
                  }
                  aria-label={blockLabel}
                  onClick={() => {
                    if (client.blocked) {
                      void onToggleBlock(client);
                      return;
                    }

                    const name = formatClientDisplayName(client);

                    Modal.confirm({
                      centered: true,
                      icon: null,
                      title: t("clients.blockConfirmTitle", { name }),
                      content: t("clients.blockConfirmDescription"),
                      okText: t("clients.block"),
                      okButtonProps: {
                        type: "primary",
                        danger: true,
                      },
                      cancelText: t("clients.blockConfirmCancel"),
                      onOk: () => onToggleBlock(client),
                    });
                  }}
                />
              </Tooltip>
              <Tooltip title={t("clients.delete")}>
                <Button
                  type="text"
                  size="small"
                  danger
                  loading={deleteLoadingId === client.id}
                  icon={<TrashIcon size={16} />}
                  aria-label={t("clients.delete")}
                  onClick={() => {
                    Modal.confirm({
                      title: t("clients.deleteConfirm"),
                      okText: t("clients.delete"),
                      okType: "danger",
                      onOk: () => onDelete(client.id),
                    });
                  }}
                />
              </Tooltip>
            </Flex>
          );
        },
      },
    ],
    [blockLoadingId, deleteLoadingId, onDelete, onEdit, onToggleBlock, t],
  );
}
