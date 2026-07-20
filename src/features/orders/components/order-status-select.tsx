import { Select, Space } from "antd";
import { observer } from "mobx-react-lite";
import type { CSSProperties } from "react";
import { startTransition, useCallback, useMemo, useOptimistic } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  GroupColorSwatch,
  GroupOptionWithSwatch,
} from "@/features/conversation-groups/components/group-select-visuals";
import { useEnsureOrderStatusesLoaded } from "@/features/orders/model/use-ensure-order-statuses-loaded";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import {
  type OrderStatusSelectOptionData,
  toOrderStatusSelectOptions,
} from "@/features/orders/order-status-select-options";
import { useNotification } from "@/shared/components/notification/use-notification";

type OrderStatusSelectProps = {
  orderId: number;
  statusId: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onChangeSuccess?: (nextStatusId: number) => void;
  variant?: "filled" | "outlined" | "borderless" | "underlined";
  dataQa?: string;
};

export const OrderStatusSelect = observer(
  ({
    orderId,
    statusId,
    disabled,
    className,
    style,
    onChangeSuccess,
    variant = "filled",
    dataQa = "layout-orders-list-status-select",
  }: OrderStatusSelectProps) => {
    const { t } = useTranslation();
    useEnsureOrderStatusesLoaded();

    const ordersStore = useOrdersStore();
    const notification = useNotification();
    const [optimisticStatusId, setOptimisticStatusId] = useOptimistic(statusId);

    const options = useMemo(
      () => toOrderStatusSelectOptions(ordersStore.statuses),
      [ordersStore.statuses],
    );

    const applyStatus = useCallback(
      (nextStatusId: number) => {
        if (nextStatusId === optimisticStatusId) {
          return;
        }

        setOptimisticStatusId(nextStatusId);

        startTransition(async () => {
          try {
            await ordersStore.updateOrderStatus(orderId, nextStatusId);
            onChangeSuccess?.(nextStatusId);
          } catch (e) {
            notification.error({
              title: getApiErrorMessage(e, t("orders.updateStatusError")),
            });
          }
        });
      },
      [
        notification,
        optimisticStatusId,
        orderId,
        ordersStore,
        setOptimisticStatusId,
        t,
        onChangeSuccess,
      ],
    );

    const statusesLoading =
      ordersStore.statusesLoading && ordersStore.statuses.length === 0;

    return (
      <>
        <Select
          variant={variant}
          data-qa={dataQa}
          className={className}
          style={{ minWidth: 160, ...style }}
          placeholder={t("orders.statusSelectPlaceholder")}
          loading={statusesLoading}
          disabled={disabled}
          value={optimisticStatusId}
          options={options}
          optionRender={(option) => {
            const data = option.data as OrderStatusSelectOptionData;

            return (
              <GroupOptionWithSwatch label={data.label} color={data.color} />
            );
          }}
          labelRender={(props) => {
            const id = props.value as number;
            const status =
              ordersStore.statusById.get(id) ??
              ordersStore.orders.find((order) => order.id === orderId)?.status;

            if (!status || status.id !== id) {
              return String(id);
            }

            return (
              <Space size={8} align="center">
                <GroupColorSwatch shape="circle" color={status.color} />
                <span style={{ color: status.color }}>{status.name}</span>
              </Space>
            );
          }}
          onChange={(value) => {
            void applyStatus(value);
          }}
          popupMatchSelectWidth={false}
          showSearch={{ optionFilterProp: "label" }}
        />
      </>
    );
  },
);
