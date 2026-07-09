import { Alert, Flex, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { OrderStatusCategory } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { getOrderStatusCategoryColor } from "@/features/orders/utils/group-order-statuses-by-category";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { OrderStatusesNavList } from "./order-statuses-nav-list";

const { Text } = Typography;

export const OrderStatusesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const { statusId: statusIdParam } = useParams<{ statusId?: string }>();
  const isMobileViewport = useIsMobileViewport();
  const [creatingCategory, setCreatingCategory] =
    useState<OrderStatusCategory | null>(null);

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
        path: `${pagesMap.settingsOrderStatuses}/:statusId`,
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

  if (isMobileViewport) {
    return <Outlet />;
  }

  return (
    <PaneNavSplitLayout.Root data-qa="layout-order-statuses-shell">
      <PaneNavSplitLayout.SubSidebar data-qa="layout-order-statuses-sidebar">
        <PaneSectionHeaderStack data-qa="layout-order-statuses-header">
          <PaneSectionTitle>
            <Flex align="center" justify="space-between">
              {t("orderStatuses.title")}
              <Text>{store.statuses.length}</Text>
            </Flex>
          </PaneSectionTitle>
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
                creatingCategory={creatingCategory}
                createDisabled={creatingCategory != null}
                onSelect={handleSelect}
                onCreateStatus={(category) => void handleCreateStatus(category)}
              />
            </div>
          )}
        </PaneScrollRegion>
      </PaneNavSplitLayout.SubSidebar>
      <PaneNavSplitLayout.SubMain data-qa="layout-order-statuses-main">
        <Outlet />
      </PaneNavSplitLayout.SubMain>
    </PaneNavSplitLayout.Root>
  );
});
