import { Button } from "antd";
import type { TableColumnsType } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  BillingInvoice,
  BillingInvoiceStatus,
} from "@/features/billing/model/billing.types";
import {
  formatBillingAmount,
  formatBillingDate,
  formatInvoiceTariff,
} from "@/features/billing/utils/billing-format";

import * as S from "./settings-billing.styled";

const STATUS_LABEL_KEYS: Record<BillingInvoiceStatus, string> = {
  paid: "billing.invoiceStatus.paid",
  open: "billing.invoiceStatus.open",
  void: "billing.invoiceStatus.void",
  refunded: "billing.invoiceStatus.refunded",
};

export const BILLING_INVOICE_STATUS_LABEL_KEYS = STATUS_LABEL_KEYS;

type UseBillingInvoiceTableColumnsOptions = {
  onPayInvoice?: (invoiceId: string) => void;
  payingInvoiceId?: string | null;
};

export function useBillingInvoiceTableColumns(
  options: UseBillingInvoiceTableColumnsOptions = {},
): TableColumnsType<BillingInvoice> {
  const { t } = useTranslation();
  const { onPayInvoice, payingInvoiceId } = options;

  return useMemo(
    () => [
      {
        title: t("billing.history.columns.invoice"),
        dataIndex: "number",
        key: "number",
        render: (value: string) => <S.InvoiceNumber>{value}</S.InvoiceNumber>,
      },
      {
        title: t("billing.history.columns.date"),
        key: "date",
        render: (_value, record) =>
          formatBillingDate(record.paidAt ?? record.createdAt),
      },
      {
        title: t("billing.history.columns.tariff"),
        key: "tariff",
        render: (_value, record) => formatInvoiceTariff(record, t),
      },
      {
        title: t("billing.history.columns.amount"),
        key: "amount",
        render: (_value, record) =>
          formatBillingAmount(record.amount, record.currency),
      },
      {
        title: t("billing.history.columns.status"),
        key: "status",
        render: (_value, record) => (
          <S.StatusBadge $variant={record.status}>
            {t(STATUS_LABEL_KEYS[record.status])}
          </S.StatusBadge>
        ),
      },
      ...(onPayInvoice
        ? [
            {
              title: "",
              key: "actions",
              width: 120,
              render: (_value: unknown, record: BillingInvoice) =>
                record.status === "open" ? (
                  <Button
                    size="small"
                    loading={payingInvoiceId === record.id}
                    onClick={() => onPayInvoice(record.id)}
                    data-qa={`billing-invoice-pay-${record.id}`}
                  >
                    {t("billing.history.pay")}
                  </Button>
                ) : null,
            },
          ]
        : []),
    ],
    [onPayInvoice, payingInvoiceId, t],
  );
}
