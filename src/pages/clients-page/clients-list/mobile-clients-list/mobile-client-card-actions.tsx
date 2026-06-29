import {
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Flex, Popconfirm, theme } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

type MobileClientCardActionsProps = {
  client: Client;
  deleteLoading: boolean;
  actionsDataQa: string;
  editDataQa: string;
  deleteDataQa: string;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => Promise<void>;
};

export function MobileClientCardActions({
  client,
  deleteLoading,
  actionsDataQa,
  editDataQa,
  deleteDataQa,
  onEdit,
  onDelete,
}: MobileClientCardActionsProps) {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit(client);
    setOpen(false);
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
          loading={deleteLoading}
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
