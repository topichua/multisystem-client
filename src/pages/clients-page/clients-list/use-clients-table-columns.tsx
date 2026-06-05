import type { TableColumnsType } from "antd";
import { Button, Flex, Popconfirm } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

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
        title: t("clients.firstName"),
        dataIndex: "firstName",
        key: "firstName",
        ellipsis: true,
      },
      {
        title: t("clients.lastName"),
        dataIndex: "lastName",
        key: "lastName",
        ellipsis: true,
      },
      {
        title: t("clients.phone"),
        dataIndex: "phone",
        key: "phone",
        ellipsis: true,
      },
      {
        title: t("clients.tableColumnDelivery"),
        dataIndex: "deliveryInfo",
        key: "deliveryInfo",
        ellipsis: true,
      },
      {
        title: t("clients.created"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
      },
      {
        title: t("clients.tableActions"),
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Flex gap={8} wrap="wrap">
            <Button type="link" size="small" onClick={() => onEdit(record)}>
              {t("clients.edit")}
            </Button>
            <Popconfirm
              title={t("clients.deleteConfirm")}
              onConfirm={() => void onDelete(record.id)}
            >
              <Button
                type="link"
                size="small"
                danger
                loading={deleteLoadingId === record.id}
              >
                {t("clients.delete")}
              </Button>
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [deleteLoadingId, onDelete, onEdit, t],
  );
}
