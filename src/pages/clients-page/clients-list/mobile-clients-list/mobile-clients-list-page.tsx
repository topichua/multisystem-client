import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Empty, Pagination, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { ClientFormModal } from "../client-form-modal";
import { ClientsListFiltersPanel } from "../clients-list-filters-panel";
import { ClientsListToolbar } from "../clients-list-toolbar";
import { useClientsListController } from "../controllers/use-clients-list-controller";
import { MobileClientCard } from "./mobile-client-card";
import * as S from "./mobile-clients-list-page.styled";

export const MobileClientsListPage = observer(() => {
  const { t } = useTranslation();
  const controller = useClientsListController();
  const { store } = controller;
  const clients = store.clients;
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <S.Root>
        <S.Header>
          <S.TitleCluster>
            <S.PageTitle level={3}>
              {t("clients.mobile.titles.clientsWorkspace")}
            </S.PageTitle>
          </S.TitleCluster>
          <S.CreateButton
            type="primary"
            icon={<PlusIcon size={16} />}
            aria-label={t("clients.mobile.createClientAria")}
            data-qa="clients-mobile-create"
            onClick={controller.openCreate}
          >
            <S.CreateButtonLabel>
              {t("clients.createClientCta")}
            </S.CreateButtonLabel>
          </S.CreateButton>
        </S.Header>

        <ClientsListToolbar onToggleFilters={() => setFiltersOpen(true)} />

        {store.listError && (
          <Alert type="error" title={store.listError} showIcon />
        )}

        {store.listLoading && clients.length === 0 ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : clients.length === 0 ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("clients.mobile.emptyClients")}
            />
          </S.StateContainer>
        ) : (
          <Spin spinning={store.listLoading}>
            <S.ClientList>
              {clients.map((client) => (
                <MobileClientCard
                  key={client.id}
                  client={client}
                  blockLoading={store.blockLoadingId === client.id}
                  deleteLoading={store.deleteLoadingId === client.id}
                  onEdit={controller.openEdit}
                  onToggleBlock={controller.handleToggleBlock}
                  onDelete={controller.handleDelete}
                />
              ))}
            </S.ClientList>
            {store.listTotal > store.listPageSize && (
              <S.PaginationWrap>
                <Pagination
                  current={store.listPage}
                  pageSize={store.listPageSize}
                  total={store.listTotal}
                  showSizeChanger={false}
                  simple
                  onChange={(page) => {
                    store.setListPage(page);
                  }}
                />
              </S.PaginationWrap>
            )}
          </Spin>
        )}

        <ClientsListFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </S.Root>

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
