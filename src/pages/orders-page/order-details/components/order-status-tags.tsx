import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/tag/tag";
import { EMPTY_VALUE } from "../utils/order-details.utils";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "green",
  unpaid: "red",
  partial: "orange",
  refunded: "purple",
  cancelled: "red",
  canceled: "red",
};

type StatusTagProps = {
  value: string | null | undefined;
};

export const PaymentStatusTag = ({ value }: StatusTagProps) => {
  const { t } = useTranslation();

  if (!value) {
    return <Typography.Text type="secondary">{EMPTY_VALUE}</Typography.Text>;
  }

  return (
    <Tag color={PAYMENT_STATUS_COLORS[value] ?? "default"}>
      {t(`orders.paymentStatus.${value}`, { defaultValue: value })}
    </Tag>
  );
};
