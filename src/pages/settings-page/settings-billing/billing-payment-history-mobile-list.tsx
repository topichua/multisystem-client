import { Button, Pagination, Spin } from "antd";
import { useTranslation } from "react-i18next";

import type { BillingInvoice } from "@/features/billing/model/billing.types";
import {
  formatBillingAmount,
  formatBillingDate,
  formatInvoiceTariff,
} from "@/features/billing/utils/billing-format";

import { BILLING_INVOICE_STATUS_LABEL_KEYS } from "./billing-invoice-table.constants";
import * as S from "./settings-billing.styled";

type BillingPaymentHistoryMobileListProps = {
  invoices: BillingInvoice[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  payingInvoiceId?: string | null;
  onPageChange: (page: number) => void;
  onPayInvoice?: (invoiceId: string) => void;
};

export const BillingPaymentHistoryMobileList = ({
  invoices,
  total,
  page,
  pageSize,
  loading,
  payingInvoiceId,
  onPageChange,
  onPayInvoice,
}: BillingPaymentHistoryMobileListProps) => {
  const { t } = useTranslation();

  return (
    <Spin spinning={loading}>
      {invoices.length === 0 ? (
        <S.HistoryMobileEmpty>{t("billing.history.empty")}</S.HistoryMobileEmpty>
      ) : (
        <S.HistoryMobileList>
          {invoices.map((invoice) => (
            <S.HistoryMobileItem
              key={invoice.id}
              data-qa={`billing-invoice-mobile-${invoice.id}`}
            >
              <S.HistoryMobileItemHeader>
                <S.InvoiceNumber>{invoice.number}</S.InvoiceNumber>
                <S.StatusBadge $variant={invoice.status}>
                  {t(BILLING_INVOICE_STATUS_LABEL_KEYS[invoice.status])}
                </S.StatusBadge>
              </S.HistoryMobileItemHeader>

              <S.HistoryMobileItemMeta>
                <S.HistoryMobileItemDate>
                  {formatBillingDate(invoice.paidAt ?? invoice.createdAt)}
                </S.HistoryMobileItemDate>
                <S.HistoryMobileItemTariff>
                  {formatInvoiceTariff(invoice, t)}
                </S.HistoryMobileItemTariff>
              </S.HistoryMobileItemMeta>

              <S.HistoryMobileItemFooter>
                <S.HistoryMobileAmount>
                  {formatBillingAmount(invoice.amount, invoice.currency)}
                </S.HistoryMobileAmount>
                {invoice.status === "open" && onPayInvoice ? (
                  <Button
                    size="small"
                    loading={payingInvoiceId === invoice.id}
                    onClick={() => onPayInvoice(invoice.id)}
                    data-qa={`billing-invoice-pay-${invoice.id}`}
                  >
                    {t("billing.history.pay")}
                  </Button>
                ) : null}
              </S.HistoryMobileItemFooter>
            </S.HistoryMobileItem>
          ))}
        </S.HistoryMobileList>
      )}

      {total > pageSize ? (
        <S.HistoryMobilePagination>
          <Pagination
            simple
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
          />
        </S.HistoryMobilePagination>
      ) : null}
    </Spin>
  );
};
