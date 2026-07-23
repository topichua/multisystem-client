import { Modal, Input, Spin } from "antd";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { conversationsApi } from "@/features/conversations/api/conversations-api";
import type { ManualPaymentMethod } from "@/features/integrations/model/integration.types";
import type { OrderPaymentTransaction } from "@/features/orders/model/order.types";
import { useNotification } from "@/shared/components/notification/use-notification";

import type { TranslationFn } from "../../../order-details-content.types";
import { useManualPaymentMethods } from "../hooks/use-manual-payment-methods";
import { buildPaymentClientMessage } from "../lib/build-payment-client-message";

type PaymentClientMessageEditorProps = {
  initialMessage: string;
  onChange: (value: string) => void;
};

function PaymentClientMessageEditor({
  initialMessage,
  onChange,
}: PaymentClientMessageEditorProps) {
  const [message, setMessage] = useState(initialMessage);

  return (
    <Input.TextArea
      autoSize={{ minRows: 5, maxRows: 10 }}
      value={message}
      onChange={(event) => {
        const nextValue = event.target.value;
        setMessage(nextValue);
        onChange(nextValue);
      }}
    />
  );
}

type PaymentClientMessageModalProps = {
  open: boolean;
  conversationId: number | null;
  transaction: OrderPaymentTransaction | null;
  currency: string;
  t: TranslationFn;
  onClose: () => void;
};

export function PaymentClientMessageModal({
  open,
  conversationId,
  transaction,
  currency,
  t,
  onClose,
}: PaymentClientMessageModalProps) {
  const notification = useNotification();
  const { methods, loading: methodsLoading } = useManualPaymentMethods(open);
  const [messageDraft, setMessageDraft] = useState<{
    editorKey: string;
    value: string | null;
  }>({ editorKey: "closed", value: null });
  const [sending, setSending] = useState(false);

  const selectedMethod = useMemo((): ManualPaymentMethod | null => {
    if (!transaction?.manualPaymentMethodId) {
      return null;
    }

    return (
      methods.find(
        (method) => method.id === transaction.manualPaymentMethodId,
      ) ?? null
    );
  }, [methods, transaction]);

  const isMethodLoading =
    transaction?.manualPaymentMethodId != null && methodsLoading;

  const initialMessage = useMemo(() => {
    if (!transaction || isMethodLoading) {
      return "";
    }

    return buildPaymentClientMessage({
      transaction,
      currency,
      method: selectedMethod,
      t,
    });
  }, [currency, isMethodLoading, selectedMethod, t, transaction]);

  const editorKey = transaction
    ? `${transaction.id}:${selectedMethod?.id ?? "none"}:${isMethodLoading ? "loading" : "ready"}`
    : "closed";

  const editedMessage =
    messageDraft.editorKey === editorKey ? messageDraft.value : null;
  const messageToSend = editedMessage ?? initialMessage;

  const handleClose = () => {
    setMessageDraft({ editorKey, value: null });
    onClose();
  };

  const handleSend = async () => {
    if (conversationId == null || !messageToSend.trim()) {
      return;
    }

    setSending(true);

    try {
      await conversationsApi.sendMessage(String(conversationId), {
        message: messageToSend.trim(),
      });
      notification.success({
        title: t("orders.details.paymentClientMessageSent"),
      });
      setMessageDraft({ editorKey, value: null });
      onClose();
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.details.paymentClientMessageFailed"),
        ),
      });
      throw error;
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      destroyOnHidden
      open={open}
      title={t("orders.details.paymentClientMessageModalTitle")}
      okText={t("orders.details.paymentClientMessageSend")}
      cancelText={t("orders.details.cancel")}
      confirmLoading={sending}
      okButtonProps={{
        disabled:
          !messageToSend.trim() || conversationId == null || isMethodLoading,
      }}
      onCancel={handleClose}
      onOk={handleSend}
    >
      {isMethodLoading && <Spin />}
      {!isMethodLoading && (
        <PaymentClientMessageEditor
          key={editorKey}
          initialMessage={initialMessage}
          onChange={(value) => setMessageDraft({ editorKey, value })}
        />
      )}
    </Modal>
  );
}
