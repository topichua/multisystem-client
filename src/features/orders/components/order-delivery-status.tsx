import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { base } from "@/styled/definitions/colors";

const DELIVERY_STATUS_COLOR: Record<string, string> = {
  pending: base.blue[5],
  waybill_created: base.cyan[6],
  processing: base.blue[5],
  packed: base.violet[5],
  shipped: base.geekblue[6],
  at_branch: base.orange[4],
  delivered: base.green[5],
  delivery_failed: base.red[5],
  failed: base.red[5],
  returned: base.violet[5],
  cancelled: base.red[5],
  canceled: base.red[5],
};

const FALLBACK_COLOR = base.grey[6];

const Root = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  line-height: 1.25;
  color: ${({ $color }) => $color};
`;

const Dot = styled.span<{ $color: string }>`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 4px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

type DeliveryStatusTagProps = {
  value: string | null | undefined;
};

export const DeliveryStatusTag = ({ value }: DeliveryStatusTagProps) => {
  const { t } = useTranslation();

  if (!value) {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }

  const color = DELIVERY_STATUS_COLOR[value] ?? FALLBACK_COLOR;

  return (
    <Root $color={color}>
      <Dot $color={color} aria-hidden />
      {t(`orders.deliveryStatus.${value}`, { defaultValue: value })}
    </Root>
  );
};
