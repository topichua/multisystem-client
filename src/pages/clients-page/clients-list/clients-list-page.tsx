import { Button, Flex, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import type { Client } from "@/features/clients/model/client.types";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";

import { ClientFormModal } from "./client-form-modal";
import { ClientsListFiltersPanel } from "./clients-list-filters-panel";
import { ClientsListToolbar } from "./clients-list-toolbar";
import { useClientsListController } from "./controllers/use-clients-list-controller";
import { useClientsTableColumns } from "./use-clients-table-columns";

const { Text } = Typography;

const CLIENT_ROW_NAVIGATION_BLOCKER_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-dropdown,.ant-popover,.ant-modal,[data-qa^='clients-list-actions-']";

export const ClientsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const controller = useClientsListController();
  const { store } = controller;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const columns = useClientsTableColumns({
    blockLoadingId: store.blockLoadingId,
    deleteLoadingId: store.deleteLoadingId,
    onDelete: controller.handleDelete,
    onEdit: controller.openEdit,
    onToggleBlock: controller.handleToggleBlock,
  });

  const handleOpenClient = (client: Client) => {
    navigate(getClientDetailsPath(client.id));
  };

  return (
    <>
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
          <ClientsListToolbar onToggleFilters={() => setFiltersOpen(true)} />
          {store.listError && (
            <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
              {store.listError}
            </Text>
          )}
          <Table<Client>
            rowKey="id"
            columns={columns}
            dataSource={store.clients}
            pagination={{
              current: store.listPage,
              pageSize: store.listPageSize,
              total: store.listTotal,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: (page) => {
                store.setListPage(page);
              },
            }}
            loading={store.listLoading}
            scroll={{ x: "max-content" }}
            onRow={(client) => ({
              style: {
                cursor: "pointer",
                ...(client.blocked ? { opacity: 0.5 } : null),
              },
              "data-qa": `clients-list-row-${client.id}`,
              onClick: (event) => {
                const target = event.target as HTMLElement | null;

                if (target?.closest(CLIENT_ROW_NAVIGATION_BLOCKER_SELECTOR)) {
                  return;
                }

                handleOpenClient(client);
              },
            })}
          />
          <ClientsListFiltersPanel
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
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
