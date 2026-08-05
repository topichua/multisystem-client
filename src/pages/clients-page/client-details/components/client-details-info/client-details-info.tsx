import { App, Flex, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";
import { ClientFormModal } from "@/pages/clients-page/clients-list/client-form-modal";
import { ClientBlockedBanner } from "@/pages/conversation/conversation-details/components/conversation-client-info-panel/__components/client-blocked-banner";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ClientDetailsActions } from "./client-details-actions";
import { rootStyle } from "./client-details-info.shared";
import { ClientDetailsSkeleton } from "./client-details-skeleton";
import { ClientDetailsView } from "./client-details-view";
import { useClientDetailsEdit } from "./use-client-details-edit";

export type ClientDetailsInfoProps = {
  client: Client | null;
  loading: boolean;
  onClientUpdated: (client: Client) => void;
};

export const ClientDetailsInfo = observer(function ClientDetailsInfo({
  client,
  loading,
  onClientUpdated,
}: ClientDetailsInfoProps) {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const isMobileViewport = useIsMobileViewport();
  const clientsStore = useClientsStore();
  const { form, open, saveLoading, startEdit, cancelEdit, saveEdit } =
    useClientDetailsEdit({ client, onClientUpdated });

  const isInitialLoading = loading && !client;
  const isBlockLoading =
    client != null && clientsStore.blockLoadingId === client.id;
  const canEdit = client != null && !client.blocked;
  const canCreateOrder = client != null && !client.blocked;
  const canBlock = client != null && !client.blocked;

  const handleBlock = () => {
    if (!client || client.blocked) {
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
      onOk: async () => {
        try {
          await clientsStore.setClientBlocked(client.id, true);
          onClientUpdated({ ...client, blocked: true });
          notification.success({ title: t("clients.blockSuccess") });
        } catch (error) {
          notification.error({
            title: getApiErrorMessage(error, t("clients.blockFailed")),
          });
          throw error;
        }
      },
    });
  };

  return (
    <Flex vertical gap={16} style={rootStyle} data-qa="clients-detail-info">
      {client?.blocked && (
        <ClientBlockedBanner
          client={client}
          layout={isMobileViewport ? "vertical" : "horizontal"}
          title={t("clients.details.blockedTitle")}
          description={t("clients.details.blockedDescription")}
          onClientUpdated={onClientUpdated}
        />
      )}

      <Flex
        vertical={isMobileViewport}
        align={isMobileViewport ? "stretch" : "center"}
        gap={16}
        wrap={isMobileViewport ? undefined : "wrap"}
        justify={isMobileViewport ? undefined : "space-between"}
        style={rootStyle}
      >
        {isInitialLoading ? (
          <ClientDetailsSkeleton />
        ) : client ? (
          <ClientDetailsView
            client={client}
            canEdit={canEdit}
            onEdit={startEdit}
          />
        ) : null}

        {client && (
          <ClientDetailsActions
            clientId={client.id}
            canCreateOrder={canCreateOrder}
            canBlock={canBlock}
            isBlockLoading={isBlockLoading}
            onBlock={handleBlock}
            fullWidth={isMobileViewport}
          />
        )}
      </Flex>

      <ClientFormModal
        editingClient={client}
        form={form}
        open={open}
        saveLoading={saveLoading}
        onCancel={cancelEdit}
        onSubmit={saveEdit}
      />
    </Flex>
  );
});
