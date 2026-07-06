import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Avatar, Button, Flex, Modal, Tooltip, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

import {
  formatClientDisplayName,
  formatClientDate,
  formatClientUahAmount,
  getClientInitials,
  getClientOrderStats,
} from "./client-display.utils";
import { ClientSourceTags } from "./client-source-tags";

const { Text } = Typography;

type UseClientsTableColumnsParams = {
  deleteLoadingId: number | null;
  onDelete: (id: number) => Promise<void>;
  onEdit: (client: Client) => void;
};

export function useClientsTableColumns({
  deleteLoadingId,
  onDelete,
  onEdit,
}: UseClientsTableColumnsParams): TableColumnsType<Client> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: t("clients.table.client"),
        key: "client",
        minWidth: 220,
        render: (_, client) => (
          <Flex align="center" gap={12} style={{ minWidth: 0 }}>
            <Avatar
              size={40}
              src={client.avatar_src || undefined}
              style={{ flexShrink: 0 }}
            >
              {getClientInitials(client)}
            </Avatar>
            <Text strong ellipsis style={{ minWidth: 0 }}>
              {formatClientDisplayName(client)}
            </Text>
          </Flex>
        ),
      },
      {
        title: t("clients.table.contacts"),
        key: "contacts",
        minWidth: 160,
        render: (_, client) => (
          <Text style={{ whiteSpace: "nowrap" }}>
            {client.phone?.trim() || "—"}
          </Text>
        ),
      },
      {
        title: t("clients.table.source"),
        key: "source",
        minWidth: 140,
        render: (_, client) => <ClientSourceTags client={client} />,
      },
      {
        title: t("clients.table.orders"),
        key: "orders",
        width: 110,
        align: "center",
        render: (_, client) => {
          const orderCount = getClientOrderStats(client)?.orderCount ?? 0;

          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 24,
                height: 24,
                paddingInline: 6,
                borderRadius: 999,
                background: "rgba(114, 46, 209, 0.12)",
                color: "#722ed1",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {orderCount}
            </span>
          );
        },
      },
      {
        title: t("clients.table.totalSpent"),
        key: "totalSpent",
        minWidth: 130,
        render: (_, client) => (
          <Text strong>
            {formatClientUahAmount(getClientOrderStats(client)?.totalSpent)}
          </Text>
        ),
      },
      {
        title: t("clients.table.lastOrder"),
        key: "lastOrder",
        width: 120,
        render: (_, client) => (
          <Text>
            {formatClientDate(getClientOrderStats(client)?.lastOrderAt)}
          </Text>
        ),
      },
      {
        title: t("clients.tableActions"),
        key: "actions",
        width: 96,
        fixed: "right",
        render: (_, client) => (
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
        ),
      },
    ],
    [deleteLoadingId, onDelete, onEdit, t],
  );
}
