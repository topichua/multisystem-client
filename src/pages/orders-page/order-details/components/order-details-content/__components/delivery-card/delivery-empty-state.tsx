import { PlusIcon } from "@phosphor-icons/react";
import { Alert, Button } from "antd";

import type { TranslationFn } from "../../order-details-content.types";

type DeliveryEmptyStateProps = {
  t: TranslationFn;
  onAdd: () => void;
};

export function DeliveryEmptyState({ t, onAdd }: DeliveryEmptyStateProps) {
  return (
    <Alert
      showIcon
      title={t("orders.details.deliveryNotAdded")}
      type="info"
      action={
        <Button icon={<PlusIcon size={16} />} type="primary" onClick={onAdd}>
          {t("orders.details.addDelivery")}
        </Button>
      }
    />
  );
}
