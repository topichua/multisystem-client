import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { ClientWishlistSection } from "@/pages/conversation/conversation-details/components/conversation-client-info-panel/client-wishlist/client-wishlist-section";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ClientDetailsInfo } from "./components/client-details-info/client-details-info";
import { ClientDetailsNoteSection } from "./components/client-details-note-section";
import { ClientDetailsOrdersSection } from "./components/client-details-orders-section";
import { ClientDetailsStats } from "./components/client-details-stats";
import { useClientDetails } from "./hooks/use-client-details";
import { useClientOrderStatsQuery } from "./hooks/use-client-order-stats-query";
import { useClientOrdersQuery } from "./hooks/use-client-orders-query";
import { coerceClientId } from "./utils/client-details.utils";

const { Text } = Typography;

const mobilePageRootStyle = {
  display: "flex",
  flexDirection: "column" as const,
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
};

export const ClientDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ clientId: string }>();
  const isMobileViewport = useIsMobileViewport();

  const clientId = coerceClientId(params.clientId);
  const invalidClientIdError =
    clientId == null ? t("clients.details.invalidClientId") : null;

  const {
    client,
    loading: clientLoading,
    error: clientError,
    applyClientUpdate,
  } = useClientDetails(clientId);
  const resolvedClientId = client?.id ?? null;
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    retry: retryStats,
  } = useClientOrderStatsQuery(resolvedClientId);
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    retry: retryOrders,
  } = useClientOrdersQuery(resolvedClientId);

  const handleBack = () => {
    navigate(pagesMap.clients);
  };

  const content = (
    <>
      <PaneDetailLayout.Header data-qa="layout-client-details-header">
        <Button
          type="text"
          aria-label={t("clients.details.backToClientsAria")}
          data-qa="clients-detail-back"
          icon={<ArrowLeftIcon size={20} />}
          style={{ alignSelf: "flex-start", paddingInline: 0, height: "auto" }}
          onClick={handleBack}
        >
          {t("clients.details.backToClients")}
        </Button>
      </PaneDetailLayout.Header>

      <PaneDetailLayout.Body data-qa="layout-client-details-body">
        <Flex
          vertical
          gap={16}
          style={{ minWidth: 0, maxWidth: 1100, margin: "0 auto" }}
        >
          {invalidClientIdError && (
            <Alert type="error" showIcon title={invalidClientIdError} />
          )}

          {clientError && <Alert type="error" showIcon title={clientError} />}

          {!invalidClientIdError && !clientLoading && !client && (
            <Text type="secondary">{t("clients.details.notFound")}</Text>
          )}

          {(clientLoading || client) && (
            <ClientDetailsInfo
              client={client}
              loading={clientLoading}
              onClientUpdated={applyClientUpdate}
            />
          )}

          {client && (
            <Flex vertical gap={32}>
              <ClientDetailsStats
                stats={stats}
                loading={statsLoading}
                error={statsError}
                onRetry={() => void retryStats()}
              />

              <ClientWishlistSection clientId={client.id} />

              <ClientDetailsNoteSection
                key={client.id}
                client={client}
                onClientUpdated={applyClientUpdate}
              />

              <ClientDetailsOrdersSection
                orders={orders}
                orderCount={stats?.orderCount ?? 0}
                loading={ordersLoading}
                error={ordersError}
                onRetry={() => void retryOrders()}
              />
            </Flex>
          )}
        </Flex>
      </PaneDetailLayout.Body>
    </>
  );

  if (isMobileViewport) {
    return <div style={mobilePageRootStyle}>{content}</div>;
  }

  return <PaneDetailLayout.Root inset>{content}</PaneDetailLayout.Root>;
};
