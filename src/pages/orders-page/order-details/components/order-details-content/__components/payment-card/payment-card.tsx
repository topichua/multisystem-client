import { CreditCardIcon, WalletIcon } from "@phosphor-icons/react";
import { Alert, Button, Card, Flex, Spin } from "antd";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  OrderManualPaymentPayload,
  OrderOnlinePaymentPayload,
  OrderPaymentTransaction,
} from "@/features/orders/model/order.types";
import { useNotification } from "@/shared/components/notification/use-notification";

import { PaymentStatusTag } from "../../../order-status-tags";

import type { PaymentCardProps } from "../../order-details-content.types";
import { CardTransferPaymentForm } from "./card-transfer-payment-form";
import { CashPaymentForm } from "./cash-payment-form";
import { useOrderPayments } from "./hooks/use-order-payments";
import { OnlinePaymentForm } from "./online-payment-form";
import { PaymentClientMessageModal } from "./payment-client-message-modal";
import { PaymentCollectionPanel } from "./payment-collection-panel";
import {
  PAYMENT_METHOD_VIEWS,
  type PaymentCardView,
  type PaymentCollectionMethod,
} from "./payment-card.types";
import { PaymentSummary } from "./payment-summary";
import { mergePaymentTransactions } from "./payment-transaction.utils";
import { PaymentTransactionsList } from "./payment-transactions-list";

export const PaymentCard = ({
  order,
  t,
  onCreateManualPayment,
  onCreateOnlinePayment,
  onConfirmPaymentTransaction,
  onDeletePayment,
  onRefreshOrder,
}: PaymentCardProps) => {
  const notification = useNotification();
  const [view, setView] = useState<PaymentCardView>("summary");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [messageTransaction, setMessageTransaction] =
    useState<OrderPaymentTransaction | null>(null);

  const {
    summary: paymentsSummary,
    loading: paymentsLoading,
    error: paymentsError,
    refresh: refreshPayments,
  } = useOrderPayments({
    orderId: order.id,
    onSettledChange: () => {
      void onRefreshOrder();
    },
  });

  const { dueAmount, paidAmount, remainingAmount, paymentStatus } =
    useMemo(() => {
      const paid = paymentsSummary?.paidAmount ?? order.payment.paidAmount;
      const remaining =
        paymentsSummary?.remainingAmount ??
        order.payment.remainingAmount ??
        Math.max(order.totalAmount - paid, 0);

      return {
        dueAmount: paymentsSummary?.totalAmount ?? order.totalAmount,
        paidAmount: paid,
        remainingAmount: remaining,
        paymentStatus: paymentsSummary?.paymentStatus ?? order.payment.status,
      };
    }, [
      order.payment.paidAmount,
      order.payment.remainingAmount,
      order.payment.status,
      order.totalAmount,
      paymentsSummary,
    ]);

  const transactions = useMemo(
    () =>
      mergePaymentTransactions(order.payment.payments ?? [], paymentsSummary),
    [order.payment.payments, paymentsSummary],
  );

  const canCollectPayment = remainingAmount != null && remainingAmount > 0;
  const activeView = canCollectPayment ? view : "summary";
  const currencyLabel = order.currency || "UAH";

  const handleSelectMethod = (method: PaymentCollectionMethod) => {
    const nextView = PAYMENT_METHOD_VIEWS[method];

    if (nextView) {
      setView(nextView);
    }
  };

  const handleCreateManualPayment = async (
    payload: OrderManualPaymentPayload,
  ) => {
    setSubmitting(true);

    try {
      await onCreateManualPayment(payload);
      await refreshPayments();
      setView("summary");
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(error, t("orders.details.addPaymentFailed")),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOnlinePayment = async (
    payload: OrderOnlinePaymentPayload,
  ) => {
    setSubmitting(true);

    try {
      await onCreateOnlinePayment(payload);
      await refreshPayments();
      setView("summary");
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.createPaymentLinkFailed"),
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (transactionId: number) => {
    setActionLoadingKey(`confirm:${transactionId}`);

    try {
      await onConfirmPaymentTransaction(transactionId);
      await refreshPayments();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.confirmPaymentFailed"),
        ),
      });
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDelete = async (paymentId: number) => {
    setActionLoadingKey(`delete:${paymentId}`);

    try {
      await onDeletePayment(paymentId);
      await refreshPayments();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.cancelPaymentFailed"),
        ),
      });
    } finally {
      setActionLoadingKey(null);
    }
  };

  return (
    <Card
      className="no-print print-card"
      title={
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={10}>
            <CreditCardIcon size={20} />
            <span>{t("orders.payment")}</span>
          </Flex>
          <PaymentStatusTag value={paymentStatus} />
        </Flex>
      }
    >
      <Flex gap={16} vertical>
        <PaymentSummary
          currency={order.currency}
          dueAmount={dueAmount}
          paidAmount={paidAmount}
          remainingAmount={remainingAmount}
          t={t}
        />

        {activeView === "summary" && canCollectPayment && (
          <Button
            type="primary"
            block
            icon={<WalletIcon size={16} />}
            onClick={() => setView("select_method")}
          >
            {t("orders.details.collectPayment")}
          </Button>
        )}

        {activeView === "select_method" && (
          <PaymentCollectionPanel
            t={t}
            onSelectMethod={handleSelectMethod}
            onCancel={() => setView("summary")}
          />
        )}

        {activeView === "cash" && (
          <CashPaymentForm
            remainingAmount={remainingAmount}
            currencyLabel={currencyLabel}
            submitting={submitting}
            t={t}
            onBack={() => setView("select_method")}
            onSubmit={(amount) =>
              handleCreateManualPayment({
                amount,
                manualPaymentMethodId: null,
              })
            }
          />
        )}

        {activeView === "card_transfer" && (
          <CardTransferPaymentForm
            orderId={order.id}
            remainingAmount={remainingAmount}
            currencyLabel={currencyLabel}
            submitting={submitting}
            t={t}
            onBack={() => setView("select_method")}
            onSubmit={({ amount, manualPaymentMethodId, note }) =>
              handleCreateManualPayment({
                amount,
                manualPaymentMethodId,
                note,
              })
            }
          />
        )}

        {activeView === "online" && (
          <OnlinePaymentForm
            remainingAmount={remainingAmount}
            currencyLabel={currencyLabel}
            submitting={submitting}
            t={t}
            onBack={() => setView("select_method")}
            onSubmit={handleCreateOnlinePayment}
          />
        )}

        {activeView === "summary" &&
          paymentsLoading &&
          transactions.length === 0 && (
            <Flex align="center" justify="center" style={{ minHeight: 48 }}>
              <Spin size="small" />
            </Flex>
          )}

        {activeView === "summary" &&
          paymentsError &&
          paymentsSummary == null && (
            <Alert type="warning" showIcon title={paymentsError} />
          )}

        {activeView === "summary" && (
          <PaymentTransactionsList
            currency={order.currency}
            transactions={transactions}
            actionLoadingKey={actionLoadingKey}
            canMessageClient={order.conversationId != null}
            t={t}
            onConfirm={(transactionId) => {
              void handleConfirm(transactionId);
            }}
            onDelete={(paymentId) => {
              void handleDelete(paymentId);
            }}
            onMessageClient={setMessageTransaction}
          />
        )}
      </Flex>

      <PaymentClientMessageModal
        open={messageTransaction != null}
        conversationId={order.conversationId}
        transaction={messageTransaction}
        currency={order.currency}
        t={t}
        onClose={() => setMessageTransaction(null)}
      />
    </Card>
  );
};
