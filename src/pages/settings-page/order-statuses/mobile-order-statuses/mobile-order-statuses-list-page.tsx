import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Button } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { pagesMap, getOrderStatusPath } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import type { OrderStatusesOutletContext } from "../order-statuses-layout";
import { OrderStatusesNavList } from "../order-statuses-nav-list";
import * as S from "./mobile-order-statuses-list-page.styled";

export const MobileOrderStatusesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useOrdersStore();
  const { onCreateClick, onCreateInCategory, creatingCategory } =
    useOutletContext<OrderStatusesOutletContext>();

  useEffect(() => {
    void store.loadStatuses({ force: true });
  }, [store]);

  const sortedStatuses = useMemo(
    () => [...store.statuses].sort((a, b) => a.sortOrder - b.sortOrder),
    [store.statuses],
  );

  const handleOpen = useCallback(
    (statusId: number) => {
      navigate(getOrderStatusPath(statusId));
    },
    [navigate],
  );

  return (
    <S.Root>
      <S.Header>
        <S.TitleCluster>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("orderStatuses.mobile.backToSettingsAria")}
            data-qa="orders-mobile-statuses-back"
            onClick={() => navigate(pagesMap.settings)}
          />
          <S.PageTitle level={3}>{t("orderStatuses.title")}</S.PageTitle>
        </S.TitleCluster>
        <Button
          type="primary"
          block
          icon={<PlusIcon />}
          data-qa="orders-mobile-statuses-create"
          onClick={onCreateClick}
        >
          {t("orderStatuses.createStatus")}
        </Button>
      </S.Header>

      <S.ScrollRegion>
        {store.statusesError && (
          <Alert
            type="error"
            title={store.statusesError}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {store.statusesLoading && store.statuses.length === 0 ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : (
          <S.ListWrap>
            <OrderStatusesNavList
              statuses={sortedStatuses}
              creatingCategory={creatingCategory}
              createDisabled={creatingCategory != null}
              onSelect={handleOpen}
              onCreateStatus={onCreateInCategory}
            />
          </S.ListWrap>
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
