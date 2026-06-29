import { Col, Form, Row, Segmented, Select } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaSenderType } from "@/features/integrations/model/integration.types";

import { CITY_MIN_SEARCH_LENGTH } from "../constants";
import type {
  CityOption,
  RemoteSelectState,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "../types";
import { AddressFields } from "./address-fields";
import { SelectNotFoundContent } from "./select-not-found-content";
import { WarehouseFields } from "./warehouse-fields";

type SenderStepProps = {
  citySelect: RemoteSelectState<CityOption>;
  selectedCityRef?: string;
  selectedSenderType: NovaPoshtaSenderType;
  selectedSettlementRef?: string;
  senderOptions: SenderOption[];
  streetSelect: RemoteSelectState<StreetOption>;
  warehouseSelect: RemoteSelectState<WarehouseOption>;
  onCityChange: (value: string, option?: CityOption | CityOption[]) => void;
  onSenderTypeChange: (value: string | number) => void;
  onStreetChange: (
    value: string,
    option?: StreetOption | StreetOption[],
  ) => void;
  onWarehouseChange: (
    value: string,
    option?: WarehouseOption | WarehouseOption[],
  ) => void;
};

export function SenderStep({
  citySelect,
  selectedCityRef,
  selectedSenderType,
  selectedSettlementRef,
  senderOptions,
  streetSelect,
  warehouseSelect,
  onCityChange,
  onSenderTypeChange,
  onStreetChange,
  onWarehouseChange,
}: SenderStepProps) {
  const { t } = useTranslation();
  const senderTypeOptions = useMemo(
    () => [
      {
        value: "warehouse",
        label: t("integrations.novaPoshtaWizard.senderTypes.warehouse"),
      },
      {
        value: "address",
        label: t("integrations.novaPoshtaWizard.senderTypes.address"),
      },
    ],
    [t],
  );

  return (
    <>
      <Form.Item
        label={t("integrations.novaPoshtaWizard.fields.sender.label")}
        name="sender_contact_ref"
        rules={[
          {
            required: true,
            message: t("integrations.novaPoshtaWizard.fields.sender.required"),
          },
        ]}
      >
        <Select<string, SenderOption>
          options={senderOptions}
          placeholder={t(
            "integrations.novaPoshtaWizard.fields.sender.placeholder",
          )}
        />
      </Form.Item>

      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item
            label={t("integrations.novaPoshtaWizard.fields.city.label")}
            name="sender_city_ref"
            rules={[
              {
                required: true,
                message: t(
                  "integrations.novaPoshtaWizard.fields.city.required",
                ),
              },
            ]}
          >
            <Select<string, CityOption>
              showSearch
              filterOption={false}
              options={citySelect.options}
              loading={citySelect.loading}
              searchValue={citySelect.search}
              placeholder={t(
                "integrations.novaPoshtaWizard.fields.city.placeholder",
              )}
              notFoundContent={
                <SelectNotFoundContent
                  failed={citySelect.failed}
                  loading={citySelect.loading}
                  minSearchLength={CITY_MIN_SEARCH_LENGTH}
                />
              }
              onSearch={citySelect.setSearch}
              onChange={onCityChange}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label={t("integrations.novaPoshtaWizard.fields.senderType.label")}
            name="sender_type"
          >
            <Segmented
              block
              options={senderTypeOptions}
              onChange={onSenderTypeChange}
            />
          </Form.Item>
        </Col>
      </Row>

      {selectedSenderType === "warehouse" ? (
        <WarehouseFields
          selectedCityRef={selectedCityRef}
          warehouseSelect={warehouseSelect}
          onWarehouseChange={onWarehouseChange}
        />
      ) : (
        <AddressFields
          selectedSettlementRef={selectedSettlementRef}
          streetSelect={streetSelect}
          onStreetChange={onStreetChange}
        />
      )}
    </>
  );
}
