import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";

import { WAREHOUSE_MIN_SEARCH_LENGTH } from "../constants";
import type { RemoteSelectState, WarehouseOption } from "../types";
import { SelectNotFoundContent } from "./select-not-found-content";

type WarehouseFieldsProps = {
  disabled?: boolean;
  options?: WarehouseOption[];
  warehouseSelect: RemoteSelectState<WarehouseOption>;
  onWarehouseChange: (
    value: string,
    option?: WarehouseOption | WarehouseOption[],
  ) => void;
};

export function WarehouseFields({
  disabled = false,
  options,
  warehouseSelect,
  onWarehouseChange,
}: WarehouseFieldsProps) {
  const { t } = useTranslation();

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.warehouse.label")}
      name="warehouse_ref"
      rules={[
        {
          required: true,
          message: t("integrations.novaPoshtaWizard.fields.warehouse.required"),
        },
      ]}
    >
      <Select<string, WarehouseOption>
        showSearch
        disabled={disabled}
        filterOption={false}
        options={options ?? warehouseSelect.options}
        loading={warehouseSelect.loading}
        searchValue={warehouseSelect.search}
        placeholder={t(
          "integrations.novaPoshtaWizard.fields.warehouse.placeholder",
        )}
        notFoundContent={
          <SelectNotFoundContent
            failed={warehouseSelect.failed}
            loading={warehouseSelect.loading}
            minSearchLength={WAREHOUSE_MIN_SEARCH_LENGTH}
          />
        }
        onSearch={warehouseSelect.setSearch}
        onChange={onWarehouseChange}
      />
    </Form.Item>
  );
}
