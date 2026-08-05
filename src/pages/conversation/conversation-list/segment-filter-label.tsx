import { Badge } from "antd";
import type { ReactNode } from "react";

import { BRAND_PRIMARY } from "@/styled/brand";

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
}: FilterLabelProps) => (
  <span
    aria-label={ariaLabel}
    title={ariaLabel}
    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
  >
    {icon ?? label}
    <Badge count={count} color={BRAND_PRIMARY} showZero />
  </span>
);
