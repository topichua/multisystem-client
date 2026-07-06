import { Badge, theme } from "antd";
import type { ReactNode } from "react";

type FilterLabelProps = {
  label?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  count: number;
};

export const FilterLabel = ({
  label,
  icon,
  ariaLabel,
  count,
}: FilterLabelProps) => {
  const { token } = theme.useToken();

  return (
    <span
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {icon ?? label}
      <Badge count={count} size="medium" color={token.colorPrimary} showZero />
    </span>
  );
};
