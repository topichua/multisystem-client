import { CaretRightIcon } from "@phosphor-icons/react";
import type { TableColumnsType } from "antd";
import { Flex, Select, Table, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientDetailsPath } from "@/app/router/pages-map";
import { UserAvatar } from "@/components/user-avatar";
import type {
  AnalyticsClientsTopValuable,
  AnalyticsClientsTopValuableCustomer,
  AnalyticsClientsTopValuableSort,
} from "@/features/analytics/model/analytics.types";
import { formatMoney } from "@/features/orders/utils/format-money";
import { formatDate } from "@/utils/date-time";
import { AnalyticsOverviewReportCard } from "@/pages/analytics-page/overview/components/analytics-overview-report-card";

import * as S from "./analytics-customers-top-valuable-table.styled";

const { Text } = Typography;

const SORT_SELECT_WIDTH = 220;

const TOP_VALUABLE_SORT_OPTIONS: readonly AnalyticsClientsTopValuableSort[] = [
  'lifetimeValue',
  'periodRevenue',
  'orders',
  'lastPurchase',
];

type AnalyticsCustomersTopValuableTableProps = {
  data: AnalyticsClientsTopValuable | null;
  loading?: boolean;
  sort: AnalyticsClientsTopValuableSort;
  onSortChange: (sort: AnalyticsClientsTopValuableSort) => Promise<void> | void;
};

function formatNumber(value: number): string {
  return value.toLocaleString("uk-UA");
}

export const AnalyticsCustomersTopValuableTable = ({
  data,
  loading = false,
  sort,
  onSortChange,
}: AnalyticsCustomersTopValuableTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customers = data?.customers ?? [];
  const currency = data?.currency ?? "UAH";

  const sortOptions = useMemo(
    () =>
      TOP_VALUABLE_SORT_OPTIONS.map((value) => ({
        value,
        label: t(`analytics.customers.topValuable.sort.${value}`),
      })),
    [t],
  );

  const columns = useMemo(
    (): TableColumnsType<AnalyticsClientsTopValuableCustomer> => [
      {
        title: t('analytics.customers.topValuable.columns.client'),
        key: 'client',
        width: 260,
        render: (_, customer) => (
          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
            <UserAvatar
              size={32}
              name={customer.name}
              src={customer.avatar}
              style={{ flexShrink: 0 }}
            />
            <Text strong ellipsis style={{ minWidth: 0 }}>
              {customer.name || '—'}
            </Text>
          </Flex>
        ),
      },
      {
        title: t('analytics.customers.topValuable.columns.orders'),
        dataIndex: 'orders',
        key: 'orders',
        align: 'right',
        width: 130,
        render: (value: number) => formatNumber(value),
      },
      {
        title: t('analytics.customers.topValuable.columns.periodRevenue'),
        dataIndex: 'periodRevenue',
        key: 'periodRevenue',
        align: 'right',
        width: 170,
        render: (value: number) => (
          <Text strong>{formatMoney(value, currency)}</Text>
        ),
      },
      {
        title: t('analytics.customers.topValuable.columns.lastPurchase'),
        dataIndex: 'lastPurchase',
        key: 'lastPurchase',
        width: 170,
        render: (value: string | null) => (
          <Text type="secondary">{value ? formatDate(value) || '—' : '—'}</Text>
        ),
      },
      {
        title: t('analytics.customers.topValuable.columns.lifetimeValue'),
        dataIndex: 'lifetimeValue',
        key: 'lifetimeValue',
        align: 'right',
        width: 190,
        render: (value: number) => (
          <Text strong>{formatMoney(value, currency)}</Text>
        ),
      },
      {
        key: 'open',
        width: 40,
        align: 'right',
        render: () => <CaretRightIcon size={16} />,
      },
    ],
    [currency, t],
  );

  return (
    <S.Section>
      <S.SectionTitle>
        {t("analytics.customers.topValuable.sectionTitle")}
      </S.SectionTitle>
      <AnalyticsOverviewReportCard
        title={t("analytics.customers.topValuable.title")}
        subtitle={t("analytics.customers.topValuable.subtitle")}
        dataQa="analytics-customers-top-valuable"
        contentVariant="list"
        headerAside={
          <Select<AnalyticsClientsTopValuableSort>
            value={sort}
            options={sortOptions}
            style={{ width: SORT_SELECT_WIDTH }}
            onChange={(value) => {
              void onSortChange(value);
            }}
          />
        }
        loading={loading}
        isEmpty={!loading && customers.length === 0}
      >
        <S.TableWrap>
          <Table<AnalyticsClientsTopValuableCustomer>
            rowKey="clientId"
            columns={columns}
            dataSource={customers}
            pagination={false}
            scroll={{ x: "max-content" }}
            onRow={(customer) => ({
              style: { cursor: "pointer" },
              "data-qa": `analytics-customers-top-valuable-row-${customer.clientId}`,
              onClick: () => {
                navigate(getClientDetailsPath(customer.clientId));
              },
            })}
          />
        </S.TableWrap>
      </AnalyticsOverviewReportCard>
    </S.Section>
  );
};
