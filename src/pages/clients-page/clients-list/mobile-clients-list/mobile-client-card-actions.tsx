import {
  DotsThreeIcon,
  LockIcon,
  LockOpenIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Modal, Popconfirm, theme } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

import { formatClientDisplayName } from "../client-display.utils";

type MobileClientCardActionsProps = {
  client: Client;
  blockLoading: boolean;
  deleteLoading: boolean;
  actionsDataQa: string;
  editDataQa: string;
  blockDataQa: string;
  deleteDataQa: string;
  onEdit: (client: Client) => void;
  onToggleBlock: (client: Client) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function MobileClientCardActions({
  client,
  blockLoading,
  deleteLoading,
  actionsDataQa,
  editDataQa,
  blockDataQa,
  deleteDataQa,
  onEdit,
  onToggleBlock,
  onDelete,
}: MobileClientCardActionsProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  const blockLabel = client.blocked ? t("clients.unblock") : t("clients.block");

  const handleEdit = () => {
    onEdit(client);
    setOpen(false);
  };

  const handleToggleBlock = () => {
    setOpen(false);

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
  };

  const handleDelete = async () => {
    await onDelete(client.id);
    setOpen(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        menu={{ items: [] }}
        placement="bottomRight"
        popupRender={() => (
          <Flex
            vertical
            gap={4}
            style={{
              padding: 4,
              borderRadius: token.borderRadius,
              background: token.colorBgElevated,
              boxShadow: token.boxShadowSecondary,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Button
              type="text"
              block
              icon={<PencilSimpleIcon size={16} />}
              style={{ justifyContent: "flex-start" }}
              data-qa={editDataQa}
              onClick={handleEdit}
            >
              {t("clients.edit")}
            </Button>

            <Button
              type="text"
              block
              danger={client.blocked}
              loading={blockLoading}
              icon={
                client.blocked ? (
                  <LockIcon size={16} />
                ) : (
                  <LockOpenIcon size={16} />
                )
              }
              style={{ justifyContent: "flex-start" }}
              data-qa={blockDataQa}
              onClick={handleToggleBlock}
            >
              {blockLabel}
            </Button>

            <Popconfirm
              title={t("clients.deleteConfirm")}
              okText={t("clients.delete")}
              okButtonProps={{ danger: true }}
              onConfirm={() => void handleDelete()}
            >
              <Button
                danger
                type="text"
                block
                loading={deleteLoading}
                icon={<TrashIcon size={16} />}
                style={{ justifyContent: "flex-start" }}
                data-qa={deleteDataQa}
              >
                {t("clients.delete")}
              </Button>
            </Popconfirm>
          </Flex>
        )}
      >
        <Button
          type="text"
          size="small"
          loading={blockLoading || deleteLoading}
          icon={<DotsThreeIcon size={24} />}
          aria-label={t("clients.mobile.actionsAria")}
          aria-expanded={open}
          data-qa={actionsDataQa}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
}
