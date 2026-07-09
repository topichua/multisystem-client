import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Empty, Pagination, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import { OrdersListActiveFilters } from "../orders-list-active-filters";
import { OrdersListFiltersPanel } from "../orders-list-filters-panel";
import { OrdersListToolbar } from "../orders-list-toolbar";
import { useOrdersListUrlSync } from "../use-orders-list-url-sync";
import { MobileOrderCard } from "./mobile-order-card";
import * as S from "./mobile-orders-list-page.styled";

export const MobileOrdersListPage = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);

  useOrdersListUrlSync(store);

  useEffect(() => {
    void store.loadStatuses();
  }, [store]);

  const showInitialLoader = store.listLoading && store.orders.length === 0;

  return (
    <S.Root>
      <S.Header>
        <S.TitleCluster>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("orders.mobile.backToOrdersAria")}
            data-qa="orders-mobile-list-back"
            onClick={() => navigate(pagesMap.orders)}
          />
          <S.PageTitle level={3}>{t("orders.allOrdersTitle")}</S.PageTitle>
        </S.TitleCluster>
        <S.CreateButton
          type="primary"
          icon={<PlusIcon size={16} />}
          aria-label={t("orders.createOrderCta")}
          data-qa="orders-mobile-list-create"
          onClick={() => navigate(pagesMap.ordersNew)}
        >
          <S.CreateButtonLabel>
            {t("orders.createOrderCta")}
          </S.CreateButtonLabel>
        </S.CreateButton>
      </S.Header>

      <S.ScrollRegion>
        <OrdersListToolbar onToggleFilters={() => setFiltersOpen(true)} />
        <OrdersListActiveFilters />
        {store.listError ? (
          <S.ErrorText type="danger">{store.listError}</S.ErrorText>
        ) : null}

        {showInitialLoader ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : store.orders.length === 0 && !store.listLoading ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("orders.mobile.emptyOrders")}
            />
          </S.StateContainer>
        ) : (
          <Spin spinning={store.listLoading}>
            <S.OrderList>
              {store.orders.map((order) => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </S.OrderList>
            {store.total > store.pageSize ? (
              <S.PaginationWrap>
                <Pagination
                  current={store.page}
                  pageSize={store.pageSize}
                  total={store.total}
                  showSizeChanger={false}
                  simple
                  onChange={(page) => {
                    store.setListPage(page);
                  }}
                />
              </S.PaginationWrap>
            ) : null}
          </Spin>
        )}

        <OrdersListFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </S.ScrollRegion>
    </S.Root>
  );
});
