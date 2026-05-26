import type { TableColumnsType } from "antd";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Spin,
  Table,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { instagramUserIdToApiString } from "@/features/clients/model/client-instagram-payload";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { ClientPhoneFormInput } from "@/components/client-phone-form-input";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import {
  normalizeClientPhoneForInput,
  phoneFieldRules,
} from "@/utils/phone-input";

const { Text } = Typography;

type ClientFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  delivery_info?: string;
};

const emptyForm: ClientFormValues = {
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

export const ClientsListPage = observer(() => {
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
    form.setFieldsValue(emptyForm);
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

  const columns: TableColumnsType<Client> = useMemo(
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
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              {t("clients.edit")}
            </Button>
            <Popconfirm
              title={t("clients.deleteConfirm")}
              onConfirm={() => void handleDelete(record.id)}
            >
              <Button
                type="link"
                size="small"
                danger
                loading={store.deleteLoadingId === record.id}
              >
                {t("clients.delete")}
              </Button>
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [handleDelete, openEdit, store.deleteLoadingId, t],
  );

  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        requiredMessage: t("clients.required"),
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );

  if (store.listLoading && store.clients.length === 0) {
    return (
      <>
        {contextHolder}
        <Spin style={{ marginTop: 24 }} />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header data-qa="layout-clients-list-header">
          <Flex justify="space-between" align="center" gap={16} wrap="wrap">
            <PaneSectionTitle>{t("clients.pageTitle")}</PaneSectionTitle>
            <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
              <Button type="primary" onClick={openCreate}>
                {t("clients.createClientCta")}
              </Button>
            </Flex>
          </Flex>
        </PaneDetailLayout.Header>
        <PaneDetailLayout.Body data-qa="layout-clients-table-scroll">
          {store.listError && (
            <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
              {store.listError}
            </Text>
          )}
          <Table<Client>
            rowKey="id"
            columns={columns}
            dataSource={store.clients}
            pagination={false}
            loading={store.listLoading}
            scroll={{ x: "max-content" }}
          />
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <Modal
        title={
          editingClient
            ? t("clients.modalEditTitle")
            : t("clients.modalCreateTitle")
        }
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingClient ? t("clients.save") : t("clients.modalCreateOk")}
        confirmLoading={store.saveLoading}
        destroyOnHidden
        width={480}
      >
        <Form form={form} layout="vertical" initialValues={emptyForm}>
          <Form.Item
            name="first_name"
            label={t("clients.firstName")}
            rules={[{ required: true, message: t("clients.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={t("clients.lastName")}
            rules={[{ required: true, message: t("clients.required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t("clients.phone")} rules={phoneRules}>
            <ClientPhoneFormInput
              autoComplete="tel"
              placeholder={t("clients.phonePlaceholder")}
            />
          </Form.Item>
          <Form.Item
            name="delivery_info"
            required
            label={t("clients.deliveryInfo")}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
