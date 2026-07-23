import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Button } from "antd";

import type { TranslationFn } from "../order-details-content.types";

type CollapsibleListToggleProps = {
  expanded: boolean;
  t: TranslationFn;
  onToggle: () => void;
};

export function CollapsibleListToggle({
  expanded,
  t,
  onToggle,
}: CollapsibleListToggleProps) {
  return (
    <Button
      type="link"
      size="small"
      icon={expanded ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
      iconPlacement="end"
      onClick={onToggle}
      style={{ alignSelf: "center", paddingInline: 0 }}
    >
      {expanded ? t("orders.details.showLess") : t("orders.details.showMore")}
    </Button>
  );
}
