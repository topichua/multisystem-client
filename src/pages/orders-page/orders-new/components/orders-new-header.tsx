import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";

import * as S from "../orders-new-page.styled";

type OrdersNewHeaderProps = {
  mobile?: boolean;
};

export function OrdersNewHeader({ mobile = false }: OrdersNewHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => navigate(pagesMap.ordersList);

  if (mobile) {
    return (
      <S.MobilePageHeader data-qa="layout-orders-new-header">
        <S.MobileTitleCluster>
          <S.MobileBackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("orders.mobile.backToOrdersAria")}
            data-qa="orders-mobile-new-back"
            onClick={handleBack}
          />
          <S.MobilePageTitle level={3}>
            {t("orders.create.title")}
          </S.MobilePageTitle>
        </S.MobileTitleCluster>
      </S.MobilePageHeader>
    );
  }

  return (
    <PaneDetailLayout.Header data-qa="layout-orders-new-header">
      <Button
        type="link"
        icon={<ArrowLeftIcon size={20} />}
        style={{ alignSelf: "flex-start", paddingInline: 0, height: "auto" }}
        onClick={handleBack}
      >
        {t("orders.create.backToOrders")}
      </Button>
    </PaneDetailLayout.Header>
  );
}
