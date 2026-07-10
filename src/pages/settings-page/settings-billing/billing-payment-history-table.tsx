import { Spin, Table } from "antd";
import { useTranslation } from "react-i18next";

import type { BillingInvoice } from "@/features/billing/model/billing.types";

import * as S from "./settings-billing.styled";
import { useBillingInvoiceTableColumns } from "./use-billing-invoice-table-columns";

type BillingPaymentHistoryTableProps = {
  invoices: BillingInvoice[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  payingInvoiceId?: string | null;
  onPageChange: (page: number) => void;
  onPayInvoice?: (invoiceId: string) => void;
};

export const BillingPaymentHistoryTable = ({
  invoices,
  total,
  page,
  pageSize,
  loading,
  payingInvoiceId,
  onPageChange,
  onPayInvoice,
}: BillingPaymentHistoryTableProps) => {
  const { t } = useTranslation();
  const columns = useBillingInvoiceTableColumns({
    onPayInvoice,
    payingInvoiceId,
  });

  return (
    <S.HistoryCard data-qa="billing-payment-history">
      <S.HistoryHeader>
        <S.HistoryTitle level={5}>{t("billing.history.title")}</S.HistoryTitle>
      </S.HistoryHeader>
      <S.HistoryTableWrap>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={invoices}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: onPageChange,
            }}
            locale={{ emptyText: t("billing.history.empty") }}
          />
        </Spin>
      </S.HistoryTableWrap>
    </S.HistoryCard>
  );
};
