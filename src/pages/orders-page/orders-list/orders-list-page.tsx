import { Flex, Spin, Table, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneSectionTitle } from "@/components/layout/pane-frame";
import type { OrderListItem } from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import { useOrdersTableColumns } from "./use-orders-table-columns";

const { Text } = Typography;

export const OrdersListPage = observer(() => {
  const { t } = useTranslation();
  const store = useOrdersStore();
  const columns = useOrdersTableColumns();
  const navigate = useNavigate();

  useEffect(() => {
    void store.loadStatuses();
    void store.loadOrders();
  }, [store]);

  return (
    <PaneDetailLayout.Root inset>
      <PaneDetailLayout.Header data-qa="layout-orders-list-header">
        <PaneSectionTitle>{t("orders.allOrdersTitle")}</PaneSectionTitle>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-orders-table-scroll">
        {store.listError ? (
          <Text type="danger">{store.listError}</Text>
        ) : (
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
                    navigate(`/orders/${record.id}`);
                  },
                })}
                pagination={{
                  current: store.page,
                  pageSize: store.pageSize,
                  total: store.total,
                  showSizeChanger: false,
                  onChange: (page) => {
                    store.setPage(page);
                    void store.loadOrders();
                  },
                }}
                scroll={{ x: 1100 }}
              />
            </Spin>
          </Flex>
        )}
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
