import { CheckIcon, PaperPlaneTiltIcon, XIcon } from "@phosphor-icons/react";
import { Button, Flex, Popconfirm, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import type { OrderPaymentTransaction } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import type { TranslationFn } from "../../../order-details-content.types";
import { CollapsibleListToggle } from "../../collapsible-list-toggle";
import {
  canActOnPendingPayment,
  canActOnPendingRefund,
  isConfirmedPaymentStatus,
  isDeliveryPaymentTransaction,
  isOnlinePaymentTransaction,
  isPendingPaymentStatus,
  resolvePaymentDeleteId,
  type PaymentTimelineItem,
} from "../lib/payment-transaction.utils";
import { PAYMENT_TRANSACTION_STATUS_COLORS } from "../model/payment-card.constants";
import * as S from "../payment-card.styled";

const { Text } = Typography;

const VISIBLE_ITEMS_LIMIT = 5;

type PaymentTransactionsListProps = {
  currency: string;
  items: PaymentTimelineItem[];
  actionLoadingKey: string | null;
  canMessageClient: boolean;
  t: TranslationFn;
  onConfirmPayment: (transactionId: number) => void;
  onDeletePayment: (paymentId: number) => void;
  onApproveRefund: (refundId: number) => void;
  onDeleteRefund: (refundId: number) => void;
  onMessageClient: (transaction: OrderPaymentTransaction) => void;
};

function formatPaymentDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return "—";
  }

  return parsed.format("D MMMM · HH:mm");
}

function getPaymentMethodLabel(
  transaction: OrderPaymentTransaction,
  t: TranslationFn,
): string {
  if (isOnlinePaymentTransaction(transaction)) {
    if (transaction.provider) {
      return t(`orders.paymentProvider.${transaction.provider}`, {
        defaultValue: transaction.provider,
      });
    }

    return t("orders.details.paymentMethodOnline");
  }

  const kind = transaction.manualPaymentKind ?? transaction.method;

  if (!kind) {
    return t("orders.details.paymentFallback");
  }

  return t(`orders.paymentMethodKind.${kind}`, { defaultValue: kind });
}

function getPaymentDescription(
  transaction: OrderPaymentTransaction,
  t: TranslationFn,
): string | null {
  const note = transaction.note?.trim();

  if (note) {
    return note;
  }

  if (isDeliveryPaymentTransaction(transaction)) {
    return t("orders.details.deliveryPaymentTransactionDescription");
  }

  return null;
}

function getStatusLabel(
  status: string,
  t: TranslationFn,
  options?: { isOnlinePayment?: boolean; isRefund?: boolean },
): string {
  if (options?.isRefund && status === "pending") {
    return t("orders.paymentTransactionStatus.awaiting_confirmation");
  }

  if (options?.isOnlinePayment && status === "pending") {
    return t("orders.paymentTransactionStatus.awaiting_payment");
  }

  return t(`orders.paymentTransactionStatus.${status}`, {
    defaultValue: status,
  });
}

export function PaymentTransactionsList({
  currency,
  items,
  actionLoadingKey,
  canMessageClient,
  t,
  onConfirmPayment,
  onDeletePayment,
  onApproveRefund,
  onDeleteRefund,
  onMessageClient,
}: PaymentTransactionsListProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (expanded || items.length <= VISIBLE_ITEMS_LIMIT) {
      return items;
    }

    return items.slice(0, VISIBLE_ITEMS_LIMIT);
  }, [expanded, items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Flex vertical gap={10}>
      <S.PaymentsSectionTitle>
        {t("orders.details.paymentsSection")}
      </S.PaymentsSectionTitle>

      <Flex vertical gap={12}>
        {visibleItems.map((item) => {
          if (item.kind === "refund") {
            const confirmKey = `refund-confirm:${item.refund.id}`;
            const deleteKey = `refund-delete:${item.refund.id}`;
            const isConfirming = actionLoadingKey === confirmKey;
            const isDeleting = actionLoadingKey === deleteKey;
            const showActions = canActOnPendingRefund(item.status);
            const actionsDisabled = actionLoadingKey != null;

            return (
              <S.PaymentTransactionItem key={item.key}>
                <Flex align="flex-start" justify="space-between" gap={8}>
                  <Flex align="center" gap={8}>
                    <S.PaymentAmountDot $tone="refund" aria-hidden="true" />
                    <S.PaymentRefundAmount>
                      -{formatMoney(item.amount, item.currency || currency)}
                    </S.PaymentRefundAmount>
                  </Flex>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, whiteSpace: "nowrap" }}
                  >
                    {formatPaymentDate(item.occurredAt ?? item.createdAt)}
                  </Text>
                </Flex>

                <Flex vertical gap={2} style={{ marginTop: 6 }}>
                  <Flex align="center" gap={8} wrap="wrap">
                    <Text>{t("orders.details.refundLabel")}</Text>
                    {showActions && (
                      <Tag
                        color={
                          PAYMENT_TRANSACTION_STATUS_COLORS[item.status] ??
                          "blue"
                        }
                        style={{ marginInlineEnd: 0, borderRadius: 999 }}
                      >
                        {getStatusLabel(item.status, t, { isRefund: true })}
                      </Tag>
                    )}
                  </Flex>
                  {item.note?.trim() ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.note.trim()}
                    </Text>
                  ) : null}
                </Flex>

                {showActions && (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={8}
                    style={{ marginTop: 16 }}
                  >
                    <Popconfirm
                      title={t("orders.details.confirmRefundConfirmTitle")}
                      description={t("orders.details.confirmRefundConfirmText")}
                      okText={t("orders.details.confirmPayment")}
                      cancelText={t("orders.details.cancel")}
                      disabled={actionsDisabled}
                      onConfirm={() => onApproveRefund(item.refund.id)}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckIcon size={14} />}
                        loading={isConfirming}
                        disabled={actionsDisabled}
                      >
                        {t("orders.details.confirmPayment")}
                      </Button>
                    </Popconfirm>

                    <Popconfirm
                      title={t("orders.details.cancelRefundConfirmTitle")}
                      description={t("orders.details.cancelRefundConfirmText")}
                      okText={t("orders.details.cancel")}
                      okButtonProps={{ danger: true }}
                      cancelText={t("orders.details.paymentKeepPending")}
                      disabled={actionsDisabled}
                      onConfirm={() => onDeleteRefund(item.refund.id)}
                    >
                      <Button
                        danger
                        variant="outlined"
                        size="small"
                        icon={<XIcon size={14} />}
                        loading={isDeleting}
                        disabled={actionsDisabled}
                        aria-label={t("orders.details.cancel")}
                      />
                    </Popconfirm>
                  </Flex>
                )}
              </S.PaymentTransactionItem>
            );
          }

          const transaction = item.transaction;
          const deleteId = resolvePaymentDeleteId(transaction);
          const confirmKey = `confirm:${transaction.id}`;
          const deleteKey =
            deleteId != null ? `delete:${deleteId}` : `delete:missing`;
          const isConfirming = actionLoadingKey === confirmKey;
          const isDeleting = actionLoadingKey === deleteKey;
          const isOnline = isOnlinePaymentTransaction(transaction);
          const isPending = isPendingPaymentStatus(transaction.status);
          const canActOnPending = canActOnPendingPayment(transaction);
          const showStatus = isPending;
          const showConfirmButton = isPending && !isOnline;
          const showMessageButton = isPending && canMessageClient;
          const showDeleteButton = isPending;
          const showPrimaryActions = showConfirmButton || showMessageButton;
          const showActions = showPrimaryActions || showDeleteButton;
          const description = getPaymentDescription(transaction, t);
          const isConfirmed = isConfirmedPaymentStatus(transaction.status);
          const actionsDisabled = actionLoadingKey != null;
          const primaryActionsDisabled = actionsDisabled || !canActOnPending;

          return (
            <S.PaymentTransactionItem key={item.key}>
              <Flex align="flex-start" justify="space-between" gap={8}>
                <Flex align="center" gap={8}>
                  <S.PaymentAmountDot
                    $tone={isConfirmed ? "credit" : "pending"}
                    aria-hidden="true"
                  />
                  <Text strong type={isConfirmed ? "success" : undefined}>
                    +{formatMoney(item.amount, item.currency || currency)}
                  </Text>
                </Flex>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {formatPaymentDate(item.occurredAt ?? item.createdAt)}
                </Text>
              </Flex>

              <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 6 }}>
                <Text>{getPaymentMethodLabel(transaction, t)}</Text>
                {showStatus && (
                  <Tag
                    color={
                      PAYMENT_TRANSACTION_STATUS_COLORS[transaction.status] ??
                      "default"
                    }
                    style={{ marginInlineEnd: 0, borderRadius: 999 }}
                  >
                    {getStatusLabel(transaction.status, t, {
                      isOnlinePayment: isOnline,
                    })}
                  </Tag>
                )}
              </Flex>

              {description && (
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginTop: 2 }}
                >
                  {description}
                </Text>
              )}

              {showActions && (
                <Flex
                  align="center"
                  justify={showPrimaryActions ? "space-between" : "flex-end"}
                  gap={8}
                  style={{ marginTop: 16 }}
                >
                  {showPrimaryActions && (
                    <Flex align="center" gap={8}>
                      {showConfirmButton && (
                        <Popconfirm
                          title={t("orders.details.confirmPaymentConfirmTitle")}
                          description={t(
                            "orders.details.confirmPaymentConfirmText",
                          )}
                          okText={t("orders.details.confirmPayment")}
                          cancelText={t("orders.details.cancel")}
                          disabled={primaryActionsDisabled}
                          onConfirm={() => onConfirmPayment(transaction.id)}
                        >
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckIcon size={14} />}
                            loading={isConfirming}
                            disabled={primaryActionsDisabled}
                          >
                            {t("orders.details.confirmPayment")}
                          </Button>
                        </Popconfirm>
                      )}

                      {showMessageButton && (
                        <Button
                          type="link"
                          size="small"
                          icon={<PaperPlaneTiltIcon size={14} />}
                          disabled={primaryActionsDisabled}
                          onClick={() => onMessageClient(transaction)}
                        >
                          {t("orders.details.paymentClientMessageSend")}
                        </Button>
                      )}
                    </Flex>
                  )}

                  {showDeleteButton && (
                    <Popconfirm
                      title={t("orders.details.cancelPaymentConfirmTitle")}
                      description={t("orders.details.cancelPaymentConfirmText")}
                      okText={t("orders.details.cancel")}
                      okButtonProps={{ danger: true }}
                      cancelText={t("orders.details.paymentKeepPending")}
                      disabled={actionsDisabled || deleteId == null}
                      onConfirm={() => {
                        if (deleteId != null) {
                          onDeletePayment(deleteId);
                        }
                      }}
                    >
                      <Button
                        danger
                        variant="outlined"
                        size="small"
                        icon={<XIcon size={14} />}
                        loading={isDeleting}
                        disabled={actionsDisabled || deleteId == null}
                        aria-label={t("orders.details.cancel")}
                      />
                    </Popconfirm>
                  )}
                </Flex>
              )}
            </S.PaymentTransactionItem>
          );
        })}
      </Flex>

      {items.length > VISIBLE_ITEMS_LIMIT && (
        <CollapsibleListToggle
          expanded={expanded}
          t={t}
          onToggle={() => setExpanded((current) => !current)}
        />
      )}
    </Flex>
  );
}
