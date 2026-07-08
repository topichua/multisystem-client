import { Alert, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { useEnsureWorkspaceMembersLoaded } from "@/features/workspace-members/model/use-ensure-workspace-members-loaded";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { OrderDetailsContent } from "./components/order-details-content";
import { OrderDetailsHeader } from "./components/order-details-header";
import { useOrderDetails } from "./hooks/use-order-details";
import * as S from "./order-details-page.styled";
import { coerceOrderId } from "./utils/order-details.utils";

const { Text } = Typography;

export const OrderDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();
  const isMobileViewport = useIsMobileViewport();

  useEnsureWorkspaceMembersLoaded();

  const orderId = coerceOrderId(params.orderId);
  const invalidOrderIdError =
    orderId == null ? t("orders.invalidOrderId") : null;

  const { order, loading, error, applyOrderStatusLocally } =
    useOrderDetails(orderId);

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <>
      <OrderDetailsHeader
        order={order}
        orderId={orderId}
        onBack={() => navigate(pagesMap.ordersList)}
        onPrint={handlePrint}
        onStatusChangeSuccess={applyOrderStatusLocally}
      />

      <PaneDetailLayout.Body data-qa="layout-order-details-body">
        <Spin spinning={loading}>
          {invalidOrderIdError || error ? (
            <Alert type="error" showIcon title={invalidOrderIdError || error} />
          ) : null}

          {!invalidOrderIdError && !error && !loading && !order ? (
            <Text type="secondary">{t("orders.notFound")}</Text>
          ) : null}

          {order ? <OrderDetailsContent order={order} /> : null}
        </Spin>
      </PaneDetailLayout.Body>
    </>
  );

  if (isMobileViewport) {
    return <S.PageRoot>{content}</S.PageRoot>;
  }

  return <PaneDetailLayout.Root inset>{content}</PaneDetailLayout.Root>;
};
