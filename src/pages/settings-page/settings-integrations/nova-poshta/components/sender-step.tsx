import { Col, Row } from "antd";

import type { NovaPoshtaSenderType } from "@/features/integrations/model/integration.types";

import type {
  CityOption,
  RemoteSelectState,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "../types";
import { AddressFields } from "./address-fields";
import { CitySelectField } from "./city-select-field";
import { SenderSelectField } from "./sender-select-field";
import { SenderTypeField } from "./sender-type-field";
import { WarehouseFields } from "./warehouse-fields";

type SenderStepProps = {
  cityOptions?: CityOption[];
  citySelect: RemoteSelectState<CityOption>;
  columnBreakpoint?: "sm" | "md";
  selectedCityRef?: string;
  selectedSenderType: NovaPoshtaSenderType;
  selectedSettlementRef?: string;
  senderLoading?: boolean;
  senderOptions: SenderOption[];
  senderTypeLabel?: "senderType" | "senderPlace";
  streetOptions?: StreetOption[];
  streetSelect: RemoteSelectState<StreetOption>;
  warehouseOptions?: WarehouseOption[];
  warehouseSelect: RemoteSelectState<WarehouseOption>;
  onCityChange: (value: string, option?: CityOption | CityOption[]) => void;
  onSenderChange?: (
    value: string,
    option?: SenderOption | SenderOption[],
  ) => void;
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
  cityOptions,
  citySelect,
  columnBreakpoint = "sm",
  selectedCityRef,
  selectedSenderType,
  selectedSettlementRef,
  senderLoading = false,
  senderOptions,
  senderTypeLabel = "senderType",
  streetOptions,
  streetSelect,
  warehouseOptions,
  warehouseSelect,
  onCityChange,
  onSenderChange,
  onSenderTypeChange,
  onStreetChange,
  onWarehouseChange,
}: SenderStepProps) {
  const columnProps =
    columnBreakpoint === "md" ? { md: 12 as const } : { sm: 12 as const };

  return (
    <>
      <SenderSelectField
        loading={senderLoading}
        options={senderOptions}
        onChange={onSenderChange}
      />

      <Row gutter={12}>
        <Col xs={24} {...columnProps}>
          <CitySelectField
            citySelect={citySelect}
            options={cityOptions}
            onChange={onCityChange}
          />
        </Col>

        <Col xs={24} {...columnProps}>
          <SenderTypeField
            label={senderTypeLabel}
            onChange={onSenderTypeChange}
          />
        </Col>
      </Row>

      {selectedSenderType === "warehouse" ? (
        <WarehouseFields
          disabled={!selectedCityRef}
          options={warehouseOptions}
          warehouseSelect={warehouseSelect}
          onWarehouseChange={onWarehouseChange}
        />
      ) : (
        <AddressFields
          disabled={!selectedSettlementRef}
          options={streetOptions}
          streetSelect={streetSelect}
          onStreetChange={onStreetChange}
        />
      )}
    </>
  );
}
