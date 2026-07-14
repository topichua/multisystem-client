import { MapPinIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import type { NovaPoshtaSenderType } from "@/features/integrations/model/integration.types";

import * as S from "../../settings-integrations.styled";
import type {
  CityOption,
  RemoteSelectState,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "../types";
import { SenderStep } from "./sender-step";

type SenderSectionFieldsProps = {
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

export function SenderSectionFields(props: SenderSectionFieldsProps) {
  const { t } = useTranslation();

  return (
    <S.NovaPoshtaFormSection>
      <S.NovaPoshtaSectionTitle>
        <MapPinIcon size={16} />
        <span>{t("integrations.novaPoshtaDetails.sections.sender")}</span>
      </S.NovaPoshtaSectionTitle>
      <SenderStep {...props} />
    </S.NovaPoshtaFormSection>
  );
}
