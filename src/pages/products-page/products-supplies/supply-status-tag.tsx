import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { Tag } from "@/components/tag/tag";
import type { StockSupplyStatus } from "@/features/inventory/model/inventory.types";

import {
  getSupplyStatusLabel,
  getSupplyStatusTagColor,
} from "./products-supplies.utils";

type SupplyStatusTagProps = {
  status: StockSupplyStatus;
  style?: CSSProperties;
};

export const SupplyStatusTag = ({ status, style }: SupplyStatusTagProps) => {
  const { t } = useTranslation();

  return (
    <Tag
      color={getSupplyStatusTagColor(status)}
      style={{ marginInlineEnd: 0, ...style }}
    >
      {getSupplyStatusLabel(status, t)}
    </Tag>
  );
};
