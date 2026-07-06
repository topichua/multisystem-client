import { Alert, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ClientDetailsHeader } from "./components/client-details-header";
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
    navigate(pagesMap.clientsWorkspace);
  };

  const content = (
    <>
      <ClientDetailsHeader
        client={client}
        loading={clientLoading}
        onBack={handleBack}
      />

      <PaneDetailLayout.Body data-qa="layout-client-details-body">
        <Flex vertical gap={16} style={{ minWidth: 0 }}>
          {invalidClientIdError && (
            <Alert type="error" showIcon title={invalidClientIdError} />
          )}

          {clientError && <Alert type="error" showIcon title={clientError} />}

          {!invalidClientIdError && !clientLoading && !client && (
            <Text type="secondary">{t("clients.details.notFound")}</Text>
          )}

          {client && (
            <>
              <ClientDetailsStats
                stats={stats}
                loading={statsLoading}
                error={statsError}
                onRetry={() => void retryStats()}
              />

              <ClientDetailsOrdersSection
                orders={orders}
                orderCount={stats?.orderCount ?? 0}
                loading={ordersLoading}
                error={ordersError}
                onRetry={() => void retryOrders()}
              />
            </>
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
