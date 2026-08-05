import { App, Form } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";

import type { ClientFormValues } from "../../../clients-list/controllers/use-clients-list-controller";

type UseClientDetailsEditParams = {
  client: Client | null;
  onClientUpdated: (client: Client) => void;
};

export function useClientDetailsEdit({
  client,
  onClientUpdated,
}: UseClientDetailsEditParams) {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const clientsStore = useClientsStore();
  const [form] = Form.useForm<ClientFormValues>();
  const [open, setOpen] = useState(false);

  const startEdit = () => {
    if (!client || client.blocked) {
      return;
    }

    form.setFieldsValue({
      first_name: client.firstName,
      last_name: client.lastName,
      phone: normalizeClientPhoneForInput(client.phone),
    });
    setOpen(true);
  };

  const cancelEdit = () => {
    setOpen(false);
    form.resetFields();
  };

  const saveEdit = async () => {
    if (!client) {
      return;
    }

    let values: ClientFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    try {
      await clientsStore.updateClient(client.id, {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        instagramUserIds: client.instagramUserIds ?? [],
        telegramUserIds: client.telegramUserIds ?? [],
        // Keep note when identity fields are updated via the same PUT endpoint.
        note: client.note,
      });

      const updated = clientsStore.activeClient;
      if (updated?.id === client.id) {
        onClientUpdated({
          ...updated,
          // PUT response may omit derived fields like avatar_src.
          note: updated.note ?? client.note,
          avatar_src: updated.avatar_src ?? client.avatar_src,
          orderStats: updated.orderStats ?? client.orderStats,
          links: updated.links ?? client.links,
          instagramUsers:
            updated.instagramUsers.length > 0
              ? updated.instagramUsers
              : client.instagramUsers,
          telegramUsers:
            updated.telegramUsers.length > 0
              ? updated.telegramUsers
              : client.telegramUsers,
        });
      }

      notification.success({ title: t("clients.updateSuccess") });
      setOpen(false);
      form.resetFields();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("clients.requestFailed")),
      });
      return Promise.reject();
    }
  };

  return {
    form,
    open,
    saveLoading: clientsStore.saveLoading,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
