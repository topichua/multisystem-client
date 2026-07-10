import { Spin, Table } from "antd";
import { useTranslation } from "react-i18next";

import type { BillingInvoice } from "@/features/billing/model/billing.types";

import { BillingPaymentHistoryMobileList } from "./billing-payment-history-mobile-list";
import type { BillingLayout } from "./settings-billing.styled";
import * as S from "./settings-billing.styled";
import { useBillingInvoiceTableColumns } from "./use-billing-invoice-table-columns";

type BillingPaymentHistoryTableProps = {
  invoices: BillingInvoice[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  payingInvoiceId?: string | null;
  layout?: BillingLayout;
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
  layout = "desktop",
  onPageChange,
  onPayInvoice,
}: BillingPaymentHistoryTableProps) => {
  const { t } = useTranslation();
  const isMobile = layout === "mobile";
  const columns = useBillingInvoiceTableColumns({
    onPayInvoice,
    payingInvoiceId,
  });

  return (
    <S.HistoryCard $mobile={isMobile} data-qa="billing-payment-history">
      <S.HistoryHeader $mobile={isMobile}>
        <S.HistoryTitle level={5}>{t("billing.history.title")}</S.HistoryTitle>
      </S.HistoryHeader>

      {isMobile ? (
        <BillingPaymentHistoryMobileList
          invoices={invoices}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={loading}
          payingInvoiceId={payingInvoiceId}
          onPageChange={onPageChange}
          onPayInvoice={onPayInvoice}
        />
      ) : (
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
      )}
    </S.HistoryCard>
  );
};
