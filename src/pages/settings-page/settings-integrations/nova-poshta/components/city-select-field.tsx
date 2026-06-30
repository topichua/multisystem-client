import { Form, Select } from "antd";
import { useTranslation } from "react-i18next";

import { CITY_MIN_SEARCH_LENGTH } from "../constants";
import type { CityOption, RemoteSelectState } from "../types";
import { SelectNotFoundContent } from "./select-not-found-content";

type CitySelectFieldProps = {
  citySelect: RemoteSelectState<CityOption>;
  options?: CityOption[];
  onChange: (value: string, option?: CityOption | CityOption[]) => void;
};

export function CitySelectField({
  citySelect,
  options,
  onChange,
}: CitySelectFieldProps) {
  const { t } = useTranslation();

  return (
    <Form.Item
      label={t("integrations.novaPoshtaWizard.fields.city.label")}
      name="sender_city_ref"
      rules={[
        {
          required: true,
          message: t("integrations.novaPoshtaWizard.fields.city.required"),
        },
      ]}
    >
      <Select<string, CityOption>
        showSearch
        filterOption={false}
        options={options ?? citySelect.options}
        loading={citySelect.loading}
        searchValue={citySelect.search}
        placeholder={t("integrations.novaPoshtaWizard.fields.city.placeholder")}
        notFoundContent={
          <SelectNotFoundContent
            failed={citySelect.failed}
            loading={citySelect.loading}
            minSearchLength={CITY_MIN_SEARCH_LENGTH}
          />
        }
        onSearch={citySelect.setSearch}
        onChange={onChange}
      />
    </Form.Item>
  );
}
