import { Form, Input, Select } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../../settings-integrations.styled";
import { STREET_MIN_SEARCH_LENGTH } from "../constants";
import type { RemoteSelectState, StreetOption } from "../types";
import { SelectNotFoundContent } from "./select-not-found-content";

type AddressFieldsProps = {
  options?: StreetOption[];
  streetSelect: RemoteSelectState<StreetOption>;
  disabled?: boolean;
  onStreetChange: (
    value: string,
    option?: StreetOption | StreetOption[],
  ) => void;
};

export function AddressFields({
  disabled = false,
  options,
  streetSelect,
  onStreetChange,
}: AddressFieldsProps) {
  const { t } = useTranslation();

  return (
    <S.NovaPoshtaAddressGrid>
      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.street.label")}
        name="sender_street_ref"
        rules={[
          {
            required: true,
            message: t("integrations.novaPoshtaWizard.fields.street.required"),
          },
        ]}
      >
        <Select<string, StreetOption>
          showSearch
          disabled={disabled}
          filterOption={false}
          options={options ?? streetSelect.options}
          loading={streetSelect.loading}
          searchValue={streetSelect.search}
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.street.placeholder",
          )}
          notFoundContent={
            <SelectNotFoundContent
              failed={streetSelect.failed}
              loading={streetSelect.loading}
              minSearchLength={STREET_MIN_SEARCH_LENGTH}
            />
          }
          onSearch={streetSelect.setSearch}
          onChange={onStreetChange}
        />
      </Form.Item>

      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.building.label")}
        name="sender_building"
        rules={[
          {
            required: true,
            whitespace: true,
            message: t(
              "integrations.novaPoshtaWizard.fields.building.required",
            ),
          },
        ]}
      >
        <Input
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.building.placeholder",
          )}
        />
      </Form.Item>

      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.flat.label")}
        name="sender_flat"
      >
        <Input
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.flat.placeholder",
          )}
        />
      </Form.Item>
    </S.NovaPoshtaAddressGrid>
  );
}
