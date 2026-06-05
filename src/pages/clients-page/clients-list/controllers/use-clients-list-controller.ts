import { Form, message } from "antd";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { instagramUserIdToApiString } from "@/features/clients/model/client-instagram-payload";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { normalizeClientPhoneForInput } from "@/utils/phone-input";

export type ClientFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  delivery_info?: string;
};

export const emptyClientFormValues: ClientFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
  delivery_info: "",
};

function clientToFormValues(client: Client): ClientFormValues {
  return {
    first_name: client.firstName,
    last_name: client.lastName,
    phone: normalizeClientPhoneForInput(client.phone),
    delivery_info: client.deliveryInfo,
  };
}

export function useClientsListController() {
  const { t } = useTranslation();
  const store = useClientsStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ClientFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    void store.loadClients();
  }, [store]);

  const openCreate = useCallback(() => {
    setEditingClient(null);
    form.setFieldsValue(emptyClientFormValues);
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (client: Client) => {
      setEditingClient(client);
      form.setFieldsValue(clientToFormValues(client));
      setModalOpen(true);
    },
    [form],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingClient(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    let values: ClientFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    try {
      if (editingClient) {
        await store.updateClient(editingClient.id, {
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          delivery_info: values.delivery_info ?? "",
          instagramId: instagramUserIdToApiString(
            editingClient.instagramUserId,
          ),
        });
        messageApi.success(t("clients.updateSuccess"));
      } else {
        await store.createClient({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          delivery_info: values.delivery_info ?? "",
          instagramId: "",
        });
        messageApi.success(t("clients.createSuccess"));
      }
      closeModal();
    } catch (e) {
      messageApi.error(getApiErrorMessage(e, t("clients.requestFailed")));
      return Promise.reject();
    }
  }, [closeModal, editingClient, form, messageApi, store, t]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await store.deleteClient(id);
        messageApi.success(t("clients.deleteSuccess"));
      } catch (e) {
        messageApi.error(getApiErrorMessage(e, t("clients.deleteFailed")));
      }
    },
    [messageApi, store, t],
  );

  return {
    contextHolder,
    store,
    form,
    modalOpen,
    editingClient,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}
