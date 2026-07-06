import { Button, Flex, Input, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import type { Client } from "@/features/clients/model/client.types";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { ClientFormModal } from "./client-form-modal";
import { formatClientDisplayName } from "./client-display.utils";
import { useClientsListController } from "./controllers/use-clients-list-controller";
import { useClientsTableColumns } from "./use-clients-table-columns";

const { Text } = Typography;

const CLIENT_ROW_NAVIGATION_BLOCKER_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-dropdown,.ant-popover,.ant-modal,[data-qa^='clients-list-actions-']";

const normalizeClientSearchText = (value: string) =>
  value.trim().toLocaleLowerCase();

const normalizeClientPhoneSearchText = (value: string) =>
  value.replace(/\D/g, "");

export const ClientsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const controller = useClientsListController();
  const { store } = controller;
  const [searchValue, setSearchValue] = useState("");
  const columns = useClientsTableColumns({
    deleteLoadingId: store.deleteLoadingId,
    onDelete: controller.handleDelete,
    onEdit: controller.openEdit,
  });

  const filteredClients = useMemo(() => {
    const normalizedSearch = normalizeClientSearchText(searchValue);
    const normalizedPhoneSearch = normalizeClientPhoneSearchText(searchValue);

    if (!normalizedSearch) {
      return store.clients;
    }

    return store.clients.filter((client) => {
      const name = normalizeClientSearchText(formatClientDisplayName(client));
      const phone = normalizeClientSearchText(client.phone);
      const normalizedPhone = normalizeClientPhoneSearchText(client.phone);

      return (
        name.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        (normalizedPhoneSearch.length > 0 &&
          normalizedPhone.includes(normalizedPhoneSearch))
      );
    });
  }, [searchValue, store.clients]);

  const handleOpenClient = (client: Client) => {
    navigate(getClientDetailsPath(client.id));
  };

  if (store.listLoading && store.clients.length === 0) {
    return (
      <>
        <CenteredSpinner />
      </>
    );
  }

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
          {store.listError && (
            <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
              {store.listError}
            </Text>
          )}
          <Input.Search
            allowClear
            aria-label={t("clients.searchPlaceholder")}
            data-qa="clients-list-search"
            placeholder={t("clients.searchPlaceholder")}
            value={searchValue}
            style={{ width: 300, maxWidth: "100%", marginBottom: 12 }}
            onChange={(event) => setSearchValue(event.target.value)}
            onSearch={setSearchValue}
          />
          <Table<Client>
            rowKey="id"
            columns={columns}
            dataSource={filteredClients}
            pagination={false}
            loading={store.listLoading}
            scroll={{ x: "max-content" }}
            onRow={(client) => ({
              style: { cursor: "pointer" },
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
