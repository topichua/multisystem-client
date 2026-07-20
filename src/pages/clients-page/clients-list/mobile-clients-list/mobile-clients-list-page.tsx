import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { ClientFormModal } from "../client-form-modal";
import { useClientsListController } from "../controllers/use-clients-list-controller";
import { MobileClientCard } from "./mobile-client-card";
import * as S from "./mobile-clients-list-page.styled";

export const MobileClientsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const controller = useClientsListController();
  const { store } = controller;
  const clients = store.clients;

  return (
    <>
      <S.Root>
        <S.Header>
          <S.TitleCluster>
            <S.BackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("clients.mobile.backToClientsAria")}
              data-qa="clients-mobile-list-back"
              onClick={() => navigate(pagesMap.clients)}
            />
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
          <S.ClientList>
            {clients.map((client) => (
              <MobileClientCard
                key={client.id}
                client={client}
                deleteLoading={store.deleteLoadingId === client.id}
                onEdit={controller.openEdit}
                onDelete={controller.handleDelete}
              />
            ))}
          </S.ClientList>
        )}
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
