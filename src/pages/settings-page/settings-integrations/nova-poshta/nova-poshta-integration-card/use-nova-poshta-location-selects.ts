import type { FormInstance } from "antd";
import { Form } from "antd";
import { useCallback, useMemo } from "react";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type {
  NovaPoshtaIntegrationDetails,
  NovaPoshtaSenderType,
} from "@/features/integrations/model/integration.types";

import {
  CITY_MIN_SEARCH_LENGTH,
  STREET_MIN_SEARCH_LENGTH,
  WAREHOUSE_MIN_SEARCH_LENGTH,
} from "../constants";
import { firstOption, getClearLocationFieldsValues } from "../helpers";
import {
  settlementsToOptions,
  streetsToOptions,
  warehousesToOptions,
} from "../options";
import type { CityOption, StreetOption, WarehouseOption } from "../types";
import { useRemoteSelect } from "../use-remote-select";
import {
  buildCurrentCityOption,
  buildCurrentStreetOption,
  buildCurrentWarehouseOption,
  mergeCurrentOption,
} from "./nova-poshta-integration-card.helpers";
import type {
  NovaPoshtaIntegrationEditFormValues,
  NovaPoshtaLocationSelects,
} from "./nova-poshta-integration-card.types";

type UseNovaPoshtaLocationSelectsParams = {
  details: NovaPoshtaIntegrationDetails | null;
  form: FormInstance<NovaPoshtaIntegrationEditFormValues>;
  isEditing: boolean;
};

export function useNovaPoshtaLocationSelects({
  details,
  form,
  isEditing,
}: UseNovaPoshtaLocationSelectsParams): NovaPoshtaLocationSelects {
  const selectedSenderType =
    Form.useWatch("sender_type", form) ?? details?.sender_type ?? "warehouse";
  const selectedCityRef = Form.useWatch("sender_city_ref", form);
  const selectedSettlementRef =
    Form.useWatch("sender_settlement_ref", form) ?? selectedCityRef;

  const loadCityOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const integrationId = details?.id;

      if (integrationId == null) {
        return [];
      }

      const settlements = await integrationsApi.searchNovaPoshtaSettlements(
        {
          auth: { novaPoshtaIntegrationId: integrationId },
          query,
        },
        { signal },
      );

      return settlementsToOptions(settlements);
    },
    [details?.id],
  );

  const loadWarehouseOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const integrationId = details?.id;

      if (!selectedSettlementRef || integrationId == null) {
        return [];
      }

      const warehouses = await integrationsApi.searchNovaPoshtaWarehouses(
        {
          auth: { novaPoshtaIntegrationId: integrationId },
          ref: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return warehousesToOptions(warehouses);
    },
    [details?.id, selectedSettlementRef],
  );

  const loadStreetOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const integrationId = details?.id;

      if (!selectedSettlementRef || integrationId == null) {
        return [];
      }

      const streets = await integrationsApi.searchNovaPoshtaStreets(
        {
          auth: { novaPoshtaIntegrationId: integrationId },
          settlementRef: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return streetsToOptions(streets);
    },
    [details?.id, selectedSettlementRef],
  );

  const citySelect = useRemoteSelect<CityOption>({
    enabled: isEditing,
    minSearchLength: CITY_MIN_SEARCH_LENGTH,
    loadOptions: loadCityOptions,
  });
  const warehouseSelect = useRemoteSelect<WarehouseOption>({
    enabled: isEditing && selectedSenderType === "warehouse",
    minSearchLength: WAREHOUSE_MIN_SEARCH_LENGTH,
    loadOptions: loadWarehouseOptions,
  });
  const streetSelect = useRemoteSelect<StreetOption>({
    enabled: isEditing && selectedSenderType === "address",
    minSearchLength: STREET_MIN_SEARCH_LENGTH,
    loadOptions: loadStreetOptions,
  });

  const currentCityOption = useMemo(
    () => buildCurrentCityOption(details),
    [details],
  );
  const currentWarehouseOption = useMemo(
    () => buildCurrentWarehouseOption(details),
    [details],
  );
  const currentStreetOption = useMemo(
    () => buildCurrentStreetOption(details),
    [details],
  );
  const cityOptions = useMemo(
    () => mergeCurrentOption(currentCityOption, citySelect.options),
    [citySelect.options, currentCityOption],
  );
  const warehouseOptions = useMemo(
    () => mergeCurrentOption(currentWarehouseOption, warehouseSelect.options),
    [currentWarehouseOption, warehouseSelect.options],
  );
  const streetOptions = useMemo(
    () => mergeCurrentOption(currentStreetOption, streetSelect.options),
    [currentStreetOption, streetSelect.options],
  );

  const clearSelects = useCallback(() => {
    citySelect.clear();
    warehouseSelect.clear();
    streetSelect.clear();
  }, [citySelect, streetSelect, warehouseSelect]);

  const clearLocationFields = useCallback(() => {
    form.setFieldsValue(getClearLocationFieldsValues());
    warehouseSelect.clear();
    streetSelect.clear();
  }, [form, streetSelect, warehouseSelect]);

  const handleCityChange = useCallback(
    (_value: string, option?: CityOption | CityOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({
        sender_city_name: selectedOption.cityName,
        sender_settlement_ref: selectedOption.settlementRef,
        ...getClearLocationFieldsValues(),
      });
      citySelect.clearSearch();
      warehouseSelect.clear();
      streetSelect.clear();
    },
    [citySelect, form, streetSelect, warehouseSelect],
  );

  const handleWarehouseChange = useCallback(
    (_value: string, option?: WarehouseOption | WarehouseOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({ warehouse_name: selectedOption.warehouseName });
      warehouseSelect.clearSearch();
    },
    [form, warehouseSelect],
  );

  const handleStreetChange = useCallback(
    (_value: string, option?: StreetOption | StreetOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({ sender_street_name: selectedOption.streetName });
      streetSelect.clearSearch();
    },
    [form, streetSelect],
  );

  const handleSenderTypeChange = useCallback(
    (value: string | number) => {
      form.setFieldsValue({
        sender_type: value as NovaPoshtaSenderType,
      });
      clearLocationFields();
    },
    [clearLocationFields, form],
  );

  return {
    cityOptions,
    citySelect,
    clearSelects,
    form,
    onCityChange: handleCityChange,
    onSenderTypeChange: handleSenderTypeChange,
    onStreetChange: handleStreetChange,
    onWarehouseChange: handleWarehouseChange,
    selectedCityRef,
    selectedSenderType,
    selectedSettlementRef,
    streetOptions,
    streetSelect,
    warehouseOptions,
    warehouseSelect,
  };
}
