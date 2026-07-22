import { CheckIcon, PaperPlaneTiltIcon, XIcon } from "@phosphor-icons/react";
import { Button, Flex, Popconfirm, Tag, Typography } from "antd";
import dayjs from "dayjs";

import type { OrderPaymentTransaction } from "@/features/orders/model/order.types";
import { formatMoney } from "@/features/orders/utils/format-money";

import type { TranslationFn } from "../../order-details-content.types";
import { PAYMENT_TRANSACTION_STATUS_COLORS } from "./payment-card.constants";
import * as S from "./payment-card.styled";
import {
  canActOnPendingPayment,
  getPaymentTransactionListKey,
  isOnlinePaymentTransaction,
  resolvePaymentDeleteId,
} from "./payment-transaction.utils";

const { Text } = Typography;

type PaymentTransactionsListProps = {
  currency: string;
  transactions: OrderPaymentTransaction[];
  actionLoadingKey: string | null;
  canMessageClient: boolean;
  t: TranslationFn;
  onConfirm: (transactionId: number) => void;
  onDelete: (paymentId: number) => void;
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

function getMethodLabel(
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

function getStatusLabel(
  status: string,
  t: TranslationFn,
  isOnline: boolean,
): string {
  if (isOnline && status === "pending") {
    return t("orders.paymentTransactionStatus.awaiting_payment");
  }

  return t(`orders.paymentTransactionStatus.${status}`, {
    defaultValue: status,
  });
}

export function PaymentTransactionsList({
  currency,
  transactions,
  actionLoadingKey,
  canMessageClient,
  t,
  onConfirm,
  onDelete,
  onMessageClient,
}: PaymentTransactionsListProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <Flex vertical gap={10}>
      <S.PaymentsSectionTitle>
        {t("orders.details.paymentsSection")}
      </S.PaymentsSectionTitle>

      <Flex vertical gap={12}>
        {transactions.map((transaction) => {
          const deleteId = resolvePaymentDeleteId(transaction);
          const confirmKey = `confirm:${transaction.id}`;
          const deleteKey =
            deleteId != null ? `delete:${deleteId}` : `delete:missing`;
          const isConfirming = actionLoadingKey === confirmKey;
          const isDeleting = actionLoadingKey === deleteKey;
          const isOnline = isOnlinePaymentTransaction(transaction);
          const showActions = canActOnPendingPayment(transaction.status);
          const actionsDisabled = actionLoadingKey != null;

          return (
            <S.PaymentTransactionItem
              key={getPaymentTransactionListKey(transaction)}
            >
              <Flex align="flex-start" justify="space-between" gap={8}>
                <Flex align="center" gap={8}>
                  <S.PaymentAmountDot aria-hidden="true" />
                  <Text strong>
                    +
                    {formatMoney(
                      transaction.amount,
                      transaction.currency || currency,
                    )}
                  </Text>
                </Flex>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {formatPaymentDate(
                    transaction.occurredAt ?? transaction.createdAt,
                  )}
                </Text>
              </Flex>

              <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 6 }}>
                <Text>{getMethodLabel(transaction, t)}</Text>
                <Tag
                  color={
                    PAYMENT_TRANSACTION_STATUS_COLORS[transaction.status] ??
                    "default"
                  }
                  style={{ marginInlineEnd: 0, borderRadius: 999 }}
                >
                  {getStatusLabel(transaction.status, t, isOnline)}
                </Tag>
              </Flex>

              {showActions && (
                <Flex vertical gap={8}>
                  {isOnline && (
                    <>
                      {canMessageClient && (
                        <Button
                          type="link"
                          block
                          icon={<PaperPlaneTiltIcon size={14} />}
                          disabled={actionsDisabled}
                          onClick={() => onMessageClient(transaction)}
                        >
                          {t("orders.details.writeToClient")}
                        </Button>
                      )}

                      <Popconfirm
                        title={t("orders.details.cancelPaymentConfirmTitle")}
                        description={t(
                          "orders.details.cancelPaymentConfirmText",
                        )}
                        okText={t("orders.details.cancel")}
                        okButtonProps={{ danger: true }}
                        cancelText={t("orders.details.paymentKeepPending")}
                        disabled={actionsDisabled || deleteId == null}
                        onConfirm={() => {
                          if (deleteId != null) {
                            onDelete(deleteId);
                          }
                        }}
                      >
                        <Button
                          danger
                          variant="outlined"
                          block
                          icon={<XIcon size={14} />}
                          loading={isDeleting}
                          disabled={actionsDisabled || deleteId == null}
                        >
                          {t("orders.details.cancel")}
                        </Button>
                      </Popconfirm>
                    </>
                  )}

                  {!isOnline && (
                    <>
                      {canMessageClient && (
                        <Button
                          block
                          type="link"
                          icon={<PaperPlaneTiltIcon size={14} />}
                          disabled={actionsDisabled}
                          onClick={() => onMessageClient(transaction)}
                        >
                          {t("orders.details.writeToClient")}
                        </Button>
                      )}
                      <Flex gap={8}>
                        <div style={{ flex: 1 }}>
                          <Popconfirm
                            title={t(
                              "orders.details.confirmPaymentConfirmTitle",
                            )}
                            description={t(
                              "orders.details.confirmPaymentConfirmText",
                            )}
                            okText={t("orders.details.confirmPayment")}
                            cancelText={t("orders.details.cancel")}
                            disabled={actionsDisabled}
                            onConfirm={() => onConfirm(transaction.id)}
                          >
                            <Button
                              variant="outlined"
                              block
                              icon={<CheckIcon size={14} />}
                              loading={isConfirming}
                              disabled={actionsDisabled}
                            >
                              {t("orders.details.confirmPayment")}
                            </Button>
                          </Popconfirm>
                        </div>

                        <div style={{ flex: 1 }}>
                          <Popconfirm
                            title={t(
                              "orders.details.cancelPaymentConfirmTitle",
                            )}
                            description={t(
                              "orders.details.cancelPaymentConfirmText",
                            )}
                            okText={t("orders.details.cancel")}
                            okButtonProps={{ danger: true }}
                            cancelText={t("orders.details.paymentKeepPending")}
                            disabled={actionsDisabled || deleteId == null}
                            onConfirm={() => {
                              if (deleteId != null) {
                                onDelete(deleteId);
                              }
                            }}
                          >
                            <Button
                              variant="outlined"
                              danger
                              block
                              icon={<XIcon size={14} />}
                              loading={isDeleting}
                              disabled={actionsDisabled || deleteId == null}
                            >
                              {t("orders.details.cancel")}
                            </Button>
                          </Popconfirm>
                        </div>
                      </Flex>
                    </>
                  )}
                </Flex>
              )}
            </S.PaymentTransactionItem>
          );
        })}
      </Flex>
    </Flex>
  );
}
