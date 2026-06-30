import type { FormInstance } from "antd";
import { useCallback } from "react";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { NovaPoshtaSenderType } from "@/features/integrations/model/integration.types";

import {
  CITY_MIN_SEARCH_LENGTH,
  STREET_MIN_SEARCH_LENGTH,
  WAREHOUSE_MIN_SEARCH_LENGTH,
} from "./constants";
import {
  settlementsToOptions,
  streetsToOptions,
  warehousesToOptions,
} from "./options";
import type { NovaPoshtaWizardFormValues } from "./types";
import { useRemoteSelect } from "./use-remote-select";

type UseNovaPoshtaSelectsParams = {
  currentStep: number;
  form: FormInstance<NovaPoshtaWizardFormValues>;
  selectedSenderType: NovaPoshtaSenderType;
  selectedSettlementRef?: string;
};

export function useNovaPoshtaSelects({
  currentStep,
  form,
  selectedSenderType,
  selectedSettlementRef,
}: UseNovaPoshtaSelectsParams) {
  const loadCityOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const apiKey = form.getFieldValue("apiKey");

      if (typeof apiKey !== "string" || !apiKey.trim()) {
        return [];
      }

      const settlements = await integrationsApi.searchNovaPoshtaSettlements(
        { auth: { apiKey }, query },
        { signal },
      );

      return settlementsToOptions(settlements);
    },
    [form],
  );

  const loadWarehouseOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const apiKey = form.getFieldValue("apiKey");

      if (
        !selectedSettlementRef ||
        typeof apiKey !== "string" ||
        !apiKey.trim()
      ) {
        return [];
      }

      const warehouses = await integrationsApi.searchNovaPoshtaWarehouses(
        {
          auth: { apiKey },
          ref: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return warehousesToOptions(warehouses);
    },
    [form, selectedSettlementRef],
  );

  const loadStreetOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const apiKey = form.getFieldValue("apiKey");

      if (
        !selectedSettlementRef ||
        typeof apiKey !== "string" ||
        !apiKey.trim()
      ) {
        return [];
      }

      const streets = await integrationsApi.searchNovaPoshtaStreets(
        {
          auth: { apiKey },
          settlementRef: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return streetsToOptions(streets);
    },
    [form, selectedSettlementRef],
  );

  const citySelect = useRemoteSelect({
    enabled: currentStep === 1,
    minSearchLength: CITY_MIN_SEARCH_LENGTH,
    loadOptions: loadCityOptions,
  });
  const warehouseSelect = useRemoteSelect({
    enabled:
      currentStep === 1 &&
      selectedSenderType === "warehouse" &&
      Boolean(selectedSettlementRef),
    minSearchLength: WAREHOUSE_MIN_SEARCH_LENGTH,
    loadOptions: loadWarehouseOptions,
  });
  const streetSelect = useRemoteSelect({
    enabled:
      currentStep === 1 &&
      selectedSenderType === "address" &&
      Boolean(selectedSettlementRef),
    minSearchLength: STREET_MIN_SEARCH_LENGTH,
    loadOptions: loadStreetOptions,
  });

  return { citySelect, streetSelect, warehouseSelect };
}
