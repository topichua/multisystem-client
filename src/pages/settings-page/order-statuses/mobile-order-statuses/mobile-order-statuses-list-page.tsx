import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getOrderStatusPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { OrderStatusCategory } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { getOrderStatusCategoryColor } from "@/features/orders/utils/group-order-statuses-by-category";
import { useNotification } from "@/shared/components/notification/use-notification";

import { MobileOrderStatusesNavList } from "./mobile-order-statuses-nav-list";
import * as S from "./mobile-order-statuses-list-page.styled";

export const MobileOrderStatusesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useOrdersStore();
  const notification = useNotification();
  const [creatingCategory, setCreatingCategory] =
    useState<OrderStatusCategory | null>(null);

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

  const handleCreateStatus = useCallback(
    async (category: OrderStatusCategory) => {
      if (creatingCategory != null) {
        return;
      }

      setCreatingCategory(category);

      try {
        const created = await store.createStatus({
          name: t("orderStatuses.newStatus"),
          category,
          color: getOrderStatusCategoryColor(store.statuses, category),
          isDefault: false,
        });
        navigate(getOrderStatusPath(created.id));
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(error, t("orderStatuses.createError")),
        });
      } finally {
        setCreatingCategory(null);
      }
    },
    [creatingCategory, navigate, notification, store, t],
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
          <S.HeaderCount data-qa="orders-mobile-statuses-total-count">
            {store.statuses.length}
          </S.HeaderCount>
        </S.TitleCluster>
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
          <MobileOrderStatusesNavList
            statuses={sortedStatuses}
            creatingCategory={creatingCategory}
            createDisabled={creatingCategory != null}
            onOpen={handleOpen}
            onCreateStatus={(category) => void handleCreateStatus(category)}
          />
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
