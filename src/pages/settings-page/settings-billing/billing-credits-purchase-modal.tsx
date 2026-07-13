import { Form, InputNumber, Modal, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { BillingCreditPricing } from "@/features/billing/model/billing.types";
import {
  formatBillingAmount,
  formatBillingCurrencySymbol,
} from "@/features/billing/utils/billing-format";
import { useIsMobileViewport } from "@/utils/use-media-query";

type BillingCreditsPurchaseModalProps = {
  open: boolean;
  creditPricing: BillingCreditPricing;
  confirmLoading: boolean;
  onCancel: () => void;
  onConfirm: (creditsAmount: number) => Promise<void>;
};

type CreditsPurchaseFormValues = {
  creditsAmount: number;
};

export const BillingCreditsPurchaseModal = ({
  open,
  creditPricing,
  confirmLoading,
  onCancel,
  onConfirm,
}: BillingCreditsPurchaseModalProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const [form] = Form.useForm<CreditsPurchaseFormValues>();
  const creditsAmount = Form.useWatch("creditsAmount", form);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      creditsAmount: creditPricing.minPurchaseCredits,
    });
  }, [creditPricing.minPurchaseCredits, form, open]);

  const calculatedPrice = useMemo(() => {
    const amount =
      typeof creditsAmount === "number" && Number.isFinite(creditsAmount)
        ? creditsAmount
        : creditPricing.minPurchaseCredits;

    return amount * creditPricing.pricePerCredit;
  }, [
    creditPricing.minPurchaseCredits,
    creditPricing.pricePerCredit,
    creditsAmount,
  ]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onConfirm(values.creditsAmount);
  };

  return (
    <Modal
      open={open}
      title={t("billing.creditsModal.title")}
      width={isMobileViewport ? "min(480px, calc(100vw - 32px))" : undefined}
      centered={isMobileViewport}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnHidden
      okText={t("billing.creditsModal.confirm")}
      cancelText={t("billing.creditsModal.cancel")}
      data-qa="billing-credits-purchase-modal"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          name="creditsAmount"
          label={t("billing.creditsModal.amountLabel")}
          rules={[
            { required: true, message: t("billing.creditsModal.required") },
            {
              type: "number",
              min: creditPricing.minPurchaseCredits,
              max: creditPricing.maxPurchaseCredits,
              message: t("billing.creditsModal.range", {
                min: creditPricing.minPurchaseCredits,
                max: creditPricing.maxPurchaseCredits,
              }),
            },
          ]}
        >
          <InputNumber
            min={creditPricing.minPurchaseCredits}
            max={creditPricing.maxPurchaseCredits}
            style={{ width: "100%" }}
            data-qa="billing-credits-amount-input"
          />
        </Form.Item>
        <Typography.Text type="secondary">
          {t("billing.creditsModal.pricePreview", {
            price: formatBillingAmount(calculatedPrice, creditPricing.currency),
            symbol: formatBillingCurrencySymbol(creditPricing.currency),
          })}
        </Typography.Text>
      </Form>
    </Modal>
  );
};
