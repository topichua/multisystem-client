import { Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  OrderStatus,
  OrderStatusCategory,
} from "@/features/orders/model/order.types";
import { ColorLabelRow } from "@/shared/components/color-label-row/color-label-row";

import {
  type OrderStatusCategorySelectOptionData,
  toOrderStatusCategorySelectOptions,
} from "./order-status-category-select-options";

type OrderStatusCategorySelectProps = {
  statuses: OrderStatus[];
  disabled?: boolean;
  value?: OrderStatusCategory;
  onChange?: (value: OrderStatusCategory) => void;
};

export const OrderStatusCategorySelect = ({
  statuses,
  disabled = false,
  value,
  onChange,
}: OrderStatusCategorySelectProps) => {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      toOrderStatusCategorySelectOptions(statuses, (key) => t(key)).map(
        (option) => ({
          value: option.value,
          label: option.label,
          color: option.color,
        }),
      ),
    [statuses, t],
  );

  const optionByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  return (
    <Select
      value={value}
      disabled={disabled}
      options={options}
      onChange={onChange}
      data-qa="order-status-category-select"
      optionRender={(option) => {
        const data = option.data as OrderStatusCategorySelectOptionData;

        return <ColorLabelRow name={data.label} color={data.color} />;
      }}
      labelRender={(props) => {
        const category = props.value as OrderStatusCategory | undefined;

        if (category == null) {
          return null;
        }

        const option = optionByValue.get(category);

        if (!option) {
          return category;
        }

        return <ColorLabelRow name={option.label} color={option.color} />;
      }}
    />
  );
};
