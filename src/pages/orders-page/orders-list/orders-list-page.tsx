import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Spin, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getOrderDetailsPath, pagesMap } from "@/app/router/pages-map";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";

import { OrdersListActiveFilters } from "./orders-list-active-filters";
import { OrdersListFiltersPanel } from "./orders-list-filters-panel";
import { OrdersListToolbar } from "./orders-list-toolbar";
import { useOrdersListUrlSync } from "./use-orders-list-url-sync";
import { useOrdersTableColumns } from "./use-orders-table-columns";

const { Text } = Typography;

export const OrdersListPage = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const workspaceMembersStore = useWorkspaceMembersStore();
  const columns = useOrdersTableColumns({
    members: workspaceMembersStore.members,
  });
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);

  useOrdersListUrlSync(store);

  useEffect(() => {
    void store.loadStatuses();
  }, [store]);

  useEffect(() => {
    if (
      workspaceMembersStore.members.length === 0 &&
      !workspaceMembersStore.listLoading
    ) {
      void workspaceMembersStore.loadMembers();
    }
  }, [workspaceMembersStore]);

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-orders-list-header">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <PaneSectionTitle>{t("orders.allOrdersTitle")}</PaneSectionTitle>
          <Button
            type="primary"
            icon={<PlusIcon size={16} />}
            data-qa="orders-list-create"
            onClick={() => navigate(pagesMap.ordersNew)}
          >
            {t("orders.createOrderCta")}
          </Button>
        </Flex>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-orders-table-scroll">
        <OrdersListToolbar onToggleFilters={() => setFiltersOpen(true)} />
        <OrdersListActiveFilters />
        {store.listError ? (
          <Text type="danger" style={{ display: "block", marginBottom: 8 }}>
            {store.listError}
          </Text>
        ) : null}
        <Flex vertical gap={16} style={{ minHeight: 200 }}>
          <Spin spinning={store.listLoading}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={store.orders}
              onRow={(record: OrderListItem) => ({
                style: { cursor: "pointer" },
                onClick: (event) => {
                  const target = event.target as HTMLElement | null;
                  if (
                    target?.closest(
                      "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-dropdown,.ant-popover,[data-qa='layout-orders-list-status-select']",
                    )
                  ) {
                    return;
                  }
                  navigate(getOrderDetailsPath(record.id));
                },
              })}
              pagination={{
                current: store.page,
                pageSize: store.pageSize,
                total: store.total,
                showSizeChanger: false,
                onChange: (page) => {
                  store.setListPage(page);
                },
              }}
              scroll={{ x: 1400 }}
            />
          </Spin>
        </Flex>
        <OrdersListFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
