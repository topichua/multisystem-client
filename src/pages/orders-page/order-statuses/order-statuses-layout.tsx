import { Alert } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getOrderStatusPath, pagesMap } from "@/app/router/pages-map";
import {
  PaneScrollRegion,
  PaneSectionHeaderStack,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import { OrderStatusesNavList } from "./order-statuses-nav-list";
import { useNotification } from "@/shared/components/notification/use-notification";

export const OrderStatusesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { statusId: statusIdParam } = useParams<{ statusId?: string }>();
  const notification = useNotification();

  useEffect(() => {
    void store.loadStatuses({ force: true });
  }, [store]);

  const sortedStatuses = useMemo(
    () => [...store.statuses].sort((a, b) => a.sortOrder - b.sortOrder),
    [store.statuses],
  );

  const selectedStatusId = useMemo(() => {
    const fromPath = statusIdParam != null ? Number(statusIdParam) : NaN;
    if (Number.isFinite(fromPath)) {
      return fromPath;
    }

    const match = matchPath(
      {
        path: `${pagesMap.ordersStatuses}/:statusId`,
        end: true,
      },
      location.pathname,
    );
    const parsedId = match?.params.statusId
      ? Number(match.params.statusId)
      : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [location.pathname, statusIdParam]);

  const handleSelect = useCallback(
    (id: number) => {
      navigate(getOrderStatusPath(id));
    },
    [navigate],
  );

  const handleReorder = useCallback(
    async (ids: number[]) => {
      const currentIds = sortedStatuses.map((status) => status.id);
      if (
        ids.length === currentIds.length &&
        ids.every((id, index) => id === currentIds[index])
      ) {
        return;
      }

      try {
        await store.reorderStatuses(ids);
      } catch (e) {
        notification.error({
          title: getApiErrorMessage(e, t("orderStatuses.reorderError")),
        });
      }
    },
    [notification, sortedStatuses, store, t],
  );

  return (
    <>
      <PaneNavSplitLayout.Root data-qa="layout-order-statuses-shell">
        <PaneNavSplitLayout.SubSidebar data-qa="layout-order-statuses-sidebar">
          <PaneSectionHeaderStack data-qa="layout-order-statuses-header">
            <PaneSectionTitle>{t("orderStatuses.title")}</PaneSectionTitle>
          </PaneSectionHeaderStack>
          <PaneScrollRegion data-qa="layout-order-statuses-nav-scroll">
            {store.statusesError ? (
              <Alert
                type="error"
                title={store.statusesError}
                showIcon
                style={{ margin: 16 }}
              />
            ) : null}
            {store.statusesLoading && store.statuses.length === 0 ? (
              <CenteredSpinner minHeight={160} />
            ) : (
              <div data-qa="layout-order-statuses-nav">
                <OrderStatusesNavList
                  statuses={sortedStatuses}
                  selectedStatusId={selectedStatusId}
                  reorderDisabled={store.statusSaveLoading}
                  onSelect={handleSelect}
                  onReorder={(ids) => void handleReorder(ids)}
                />
              </div>
            )}
          </PaneScrollRegion>
        </PaneNavSplitLayout.SubSidebar>
        <PaneNavSplitLayout.SubMain data-qa="layout-order-statuses-main">
          <Outlet />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>
    </>
  );
});
