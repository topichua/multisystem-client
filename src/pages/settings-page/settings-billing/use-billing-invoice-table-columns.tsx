import { Button } from "antd";
import type { TableColumnsType } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { BillingInvoice } from "@/features/billing/model/billing.types";
import {
  formatBillingAmount,
  formatBillingDate,
  formatInvoiceTariff,
} from "@/features/billing/utils/billing-format";

import * as S from "./settings-billing.styled";
import { BILLING_INVOICE_STATUS_LABEL_KEYS } from "./billing-invoice-table.constants";

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
            {t(BILLING_INVOICE_STATUS_LABEL_KEYS[record.status])}
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
