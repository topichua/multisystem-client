import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button, Form } from "antd";
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

import { OrderStatusCreateModal } from "./order-status-create-modal";
import type { OrderStatusFormValues } from "./order-status-form-fields";
import { OrderStatusesNavList } from "./order-statuses-nav-list";

export type OrderStatusesOutletContext = {
  onCreateClick: () => void;
  onCreateInCategory: (category: OrderStatusCategory) => void;
  creatingCategory: OrderStatusCategory | null;
};

export const OrderStatusesLayout = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const { statusId: statusIdParam } = useParams<{ statusId?: string }>();
  const isMobileViewport = useIsMobileViewport();
  const [form] = Form.useForm<OrderStatusFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
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

  const openCreate = useCallback(() => {
    form.setFieldsValue({
      name: "",
      category: "new",
    });
    setModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleCreateInCategory = useCallback(
    async (category: OrderStatusCategory) => {
      if (creatingCategory != null || modalOpen) {
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
    [creatingCategory, modalOpen, navigate, notification, store, t],
  );

  const handleModalOk = useCallback(async () => {
    let values: OrderStatusFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    try {
      const created = await store.createStatus({
        name: values.name.trim(),
        category: values.category,
        color: getOrderStatusCategoryColor(store.statuses, values.category),
        isDefault: false,
      });
      notification.success({ title: t("orderStatuses.created") });
      closeModal();
      navigate(getOrderStatusPath(created.id));
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("orderStatuses.createError")),
      });
      return Promise.reject();
    }
  }, [closeModal, form, navigate, notification, store, t]);

  const outletContext = {
    onCreateClick: openCreate,
    onCreateInCategory: (category) => void handleCreateInCategory(category),
    creatingCategory,
  } satisfies OrderStatusesOutletContext;

  const createModal = (
    <OrderStatusCreateModal
      open={modalOpen}
      statuses={store.statuses}
      form={form}
      saveLoading={store.statusSaveLoading}
      onCancel={closeModal}
      onOk={handleModalOk}
    />
  );

  if (isMobileViewport) {
    return (
      <>
        <Outlet context={outletContext} />
        {createModal}
      </>
    );
  }

  return (
    <>
      <PaneNavSplitLayout.Root data-qa="layout-order-statuses-shell">
        <PaneNavSplitLayout.SubSidebar data-qa="layout-order-statuses-sidebar">
          <PaneSectionHeaderStack data-qa="layout-order-statuses-header">
            <PaneSectionTitle>{t("orderStatuses.title")}</PaneSectionTitle>
            <Button
              type="primary"
              block
              icon={<PlusIcon />}
              data-qa="order-statuses-create"
              onClick={openCreate}
            >
              {t("orderStatuses.createStatus")}
            </Button>
          </PaneSectionHeaderStack>
          <PaneScrollRegion data-qa="layout-order-statuses-nav-scroll">
            {store.statusesError && (
              <Alert
                type="error"
                title={store.statusesError}
                showIcon
                style={{ margin: 16 }}
              />
            )}
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
                  onCreateStatus={(category) =>
                    void handleCreateInCategory(category)
                  }
                />
              </div>
            )}
          </PaneScrollRegion>
        </PaneNavSplitLayout.SubSidebar>
        <PaneNavSplitLayout.SubMain data-qa="layout-order-statuses-main">
          <Outlet context={outletContext} />
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>
      {createModal}
    </>
  );
});
