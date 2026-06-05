import { Button, Flex, Spin, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";

import { ClientFormModal } from "./client-form-modal";
import { useClientsListController } from "./controllers/use-clients-list-controller";
import { useClientsTableColumns } from "./use-clients-table-columns";

const { Text } = Typography;

export const ClientsListPage = observer(() => {
  const { t } = useTranslation();
  const controller = useClientsListController();
  const { store } = controller;
  const columns = useClientsTableColumns({
    deleteLoadingId: store.deleteLoadingId,
    onDelete: controller.handleDelete,
    onEdit: controller.openEdit,
  });

  if (store.listLoading && store.clients.length === 0) {
    return (
      <>
        {controller.contextHolder}
        <Spin style={{ marginTop: 24 }} />
      </>
    );
  }

  return (
    <>
      {controller.contextHolder}
      <PaneDetailLayout.Root inset>
        <PaneDetailLayout.Header data-qa="layout-clients-list-header">
          <Flex justify="space-between" align="center" gap={16} wrap="wrap">
            <PaneSectionTitle>{t("clients.pageTitle")}</PaneSectionTitle>
            <Flex gap={8} align="center" wrap="wrap" style={{ flexShrink: 0 }}>
              <Button type="primary" onClick={controller.openCreate}>
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

      <ClientFormModal
        editingClient={controller.editingClient}
        form={controller.form}
        open={controller.modalOpen}
        saveLoading={store.saveLoading}
        onCancel={controller.closeModal}
        onSubmit={controller.handleSubmit}
      />
    </>
  );
});
