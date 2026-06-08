import { Alert, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { coerceOrderId } from "./utils/order-details.utils";
import { useOrderDetails } from "./hooks/use-order-details";
import { OrderDetailsHeader } from "./components/order-details-header";
import { OrderDetailsContent } from "./components/order-details-content";

const { Text } = Typography;

export const OrderDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();

  const orderId = coerceOrderId(params.orderId);
  const invalidOrderIdError =
    orderId == null ? t("orders.invalidOrderId") : null;

  const { order, loading, error, applyOrderStatusLocally } =
    useOrderDetails(orderId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <PaneDetailLayout.Root inset>
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
    </PaneDetailLayout.Root>
  );
};
