import {
  ArrowUUpLeftIcon,
  ClockIcon,
  CreditCardIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { Alert, Button, Card, Flex } from "antd";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type {
  OrderManualPaymentPayload,
  OrderOnlinePaymentPayload,
  OrderPaymentTransaction,
  OrderRefundCreatePayload,
} from "@/features/orders/model/order.types";
import { useNotification } from "@/shared/components/notification/use-notification";

import { PaymentStatusTag } from "../../../order-status-tags";

import type { PaymentCardProps } from "../../order-details-content.types";
import { CardTransferPaymentForm } from "./card-transfer-payment-form";
import { CashPaymentForm } from "./cash-payment-form";
import { useOrderPayments } from "./hooks/use-order-payments";
import { useOrderRefunds } from "./hooks/use-order-refunds";
import { OnlinePaymentForm } from "./online-payment-form";
import { PaymentClientMessageModal } from "./payment-client-message-modal";
import { PaymentCollectionPanel } from "./payment-collection-panel";
import {
  PAYMENT_METHOD_VIEWS,
  type PaymentCardView,
  type PaymentCollectionMethod,
} from "./payment-card.types";
import { PaymentSummary } from "./payment-summary";
import {
  buildPaymentTimelineItems,
  hasPendingActionablePayments,
  hasPendingRefunds,
  mergePaymentTransactions,
} from "./payment-transaction.utils";
import { PaymentTransactionsList } from "./payment-transactions-list";
import { RefundPaymentForm } from "./refund-payment-form";

export const PaymentCard = ({
  order,
  t,
  onCreateManualPayment,
  onCreateOnlinePayment,
  onConfirmPaymentTransaction,
  onDeletePayment,
  onCreateOrderRefund,
  onApproveOrderRefund,
  onDeleteOrderRefund,
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
    error: paymentsError,
    refresh: refreshPayments,
  } = useOrderPayments({
    orderId: order.id,
    onSettledChange: () => {
      void onRefreshOrder();
    },
  });

  const { refunds, refresh: refreshRefunds } = useOrderRefunds({
    orderId: order.id,
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

  const timelineItems = useMemo(
    () => buildPaymentTimelineItems(transactions, refunds),
    [transactions, refunds],
  );

  const hasPendingPayment = useMemo(
    () => hasPendingActionablePayments(transactions),
    [transactions],
  );
  const hasPendingRefund = useMemo(() => hasPendingRefunds(refunds), [refunds]);
  const hasBlockingPending = hasPendingPayment || hasPendingRefund;

  const canCollectPayment =
    remainingAmount != null && remainingAmount > 0 && !hasBlockingPending;
  const canRefundPayment = paidAmount > 0 && !hasBlockingPending;

  const activeView = useMemo<PaymentCardView>(() => {
    if (view === "refund") {
      return canRefundPayment ? "refund" : "summary";
    }

    if (
      view === "select_method" ||
      view === "cash" ||
      view === "card_transfer" ||
      view === "online"
    ) {
      return canCollectPayment ? view : "summary";
    }

    return "summary";
  }, [canCollectPayment, canRefundPayment, view]);

  const currencyLabel = order.currency || "UAH";
  const showSummaryActions =
    activeView === "summary" && (canCollectPayment || canRefundPayment);

  const refreshPaymentData = async () => {
    await Promise.all([refreshPayments(), refreshRefunds()]);
  };

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
      await refreshPaymentData();
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
      await refreshPaymentData();
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

  const handleCreateRefund = async (payload: OrderRefundCreatePayload) => {
    setSubmitting(true);

    try {
      await onCreateOrderRefund(payload);
      await refreshPaymentData();
      setView("summary");
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.createRefundFailed"),
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async (transactionId: number) => {
    setActionLoadingKey(`confirm:${transactionId}`);

    try {
      await onConfirmPaymentTransaction(transactionId);
      await refreshPaymentData();
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

  const handleDeletePayment = async (paymentId: number) => {
    setActionLoadingKey(`delete:${paymentId}`);

    try {
      await onDeletePayment(paymentId);
      await refreshPaymentData();
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

  const handleApproveRefund = async (refundId: number) => {
    setActionLoadingKey(`refund-confirm:${refundId}`);

    try {
      await onApproveOrderRefund(refundId);
      await refreshPaymentData();
      await onRefreshOrder();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.confirmRefundFailed"),
        ),
      });
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDeleteRefund = async (refundId: number) => {
    setActionLoadingKey(`refund-delete:${refundId}`);

    try {
      await onDeleteOrderRefund(refundId);
      await refreshPaymentData();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.cancelRefundFailed"),
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

        {activeView === "summary" && hasBlockingPending && (
          <Alert
            type="info"
            showIcon
            icon={<ClockIcon size={16} />}
            title={t("orders.details.pendingPaymentActionRequired")}
          />
        )}

        {showSummaryActions && (
          <Flex align="center" justify="space-between" wrap="wrap">
            {canCollectPayment && (
              <Button
                type="primary"
                icon={<WalletIcon size={16} />}
                onClick={() => setView("select_method")}
              >
                {t("orders.details.collectPayment")}
              </Button>
            )}

            {canRefundPayment && (
              <Button
                type="text"
                icon={<ArrowUUpLeftIcon size={16} />}
                onClick={() => setView("refund")}
              >
                {t("orders.details.refundPayment")}
              </Button>
            )}
          </Flex>
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

        {activeView === "refund" && (
          <RefundPaymentForm
            paidAmount={paidAmount}
            currencyLabel={currencyLabel}
            submitting={submitting}
            t={t}
            onBack={() => setView("summary")}
            onSubmit={handleCreateRefund}
          />
        )}

        {activeView === "summary" &&
          paymentsError &&
          paymentsSummary == null && (
            <Alert type="warning" showIcon title={paymentsError} />
          )}

        {(activeView === "summary" || activeView === "refund") &&
          timelineItems.length > 0 && (
            <PaymentTransactionsList
              currency={order.currency}
              items={timelineItems}
              actionLoadingKey={actionLoadingKey}
              canMessageClient={order.conversationId != null}
              t={t}
              onConfirmPayment={(transactionId) => {
                void handleConfirmPayment(transactionId);
              }}
              onDeletePayment={(paymentId) => {
                void handleDeletePayment(paymentId);
              }}
              onApproveRefund={(refundId) => {
                void handleApproveRefund(refundId);
              }}
              onDeleteRefund={(refundId) => {
                void handleDeleteRefund(refundId);
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
