import type { FormInstance } from "antd";
import { Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { NovaPoshtaIntegrationDetails } from "@/features/integrations/model/integration.types";
import type {
  OrderDeliveryType,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import {
  CITY_MIN_SEARCH_LENGTH,
  STREET_MIN_SEARCH_LENGTH,
  WAREHOUSE_MIN_SEARCH_LENGTH,
} from "@/pages/settings-page/settings-integrations/nova-poshta/constants";
import {
  settlementsToOptions,
  streetsToOptions,
  warehousesToOptions,
} from "@/pages/settings-page/settings-integrations/nova-poshta/options";
import type {
  CityOption,
  RemoteSelectState,
  StreetOption,
  WarehouseOption,
} from "@/pages/settings-page/settings-integrations/nova-poshta/types";
import { useRemoteSelect } from "@/pages/settings-page/settings-integrations/nova-poshta/use-remote-select";

type UseClientOrderNovaPoshtaDeliveryParams = {
  form: FormInstance<OrderFormValues>;
};

type SelectOption = {
  value: number;
  label: string;
};

export type ClientOrderNovaPoshtaDeliveryState = {
  cityOptions: CityOption[];
  citySelect: RemoteSelectState<CityOption>;
  hasProvider: boolean;
  integrationsFailed: boolean;
  integrationsLoading: boolean;
  providerOptions: SelectOption[];
  selectedDeliveryType: OrderDeliveryType;
  selectedSettlementRef?: string;
  streetOptions: StreetOption[];
  streetSelect: RemoteSelectState<StreetOption>;
  warehouseOptions: WarehouseOption[];
  warehouseSelect: RemoteSelectState<WarehouseOption>;
  clearSelects: () => void;
  onCityChange: (value: string, option?: CityOption | CityOption[]) => void;
  onDeliveryTypeChange: (value: string | number) => void;
  onProviderChange: (value: number) => void;
  onStreetChange: (
    value: string,
    option?: StreetOption | StreetOption[],
  ) => void;
  onWarehouseChange: (
    value: string,
    option?: WarehouseOption | WarehouseOption[],
  ) => void;
};

function firstOption<TOption>(
  option: TOption | TOption[] | undefined,
): TOption | undefined {
  return Array.isArray(option) ? option[0] : option;
}

function isCanceledRequest(error: unknown): boolean {
  return (
    error instanceof DOMException ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ERR_CANCELED")
  );
}

function clearCityAndLocationValues(): Partial<OrderFormValues> {
  return {
    city: undefined,
    cityRef: undefined,
    settlementRef: undefined,
    ...clearLocationValues(),
  };
}

function clearLocationValues(): Partial<OrderFormValues> {
  return {
    warehouse: undefined,
    warehouseRef: undefined,
    street: undefined,
    streetRef: undefined,
    building: undefined,
    flat: undefined,
  };
}

export function useClientOrderNovaPoshtaDelivery({
  form,
}: UseClientOrderNovaPoshtaDeliveryParams): ClientOrderNovaPoshtaDeliveryState {
  const [integrations, setIntegrations] = useState<
    NovaPoshtaIntegrationDetails[]
  >([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [integrationsFailed, setIntegrationsFailed] = useState(false);
  const selectedIntegrationId = Form.useWatch("novaPoshtaIntegrationId", form);
  const selectedDeliveryType = (Form.useWatch("deliveryType", form) ??
    "warehouse") as OrderDeliveryType;
  const selectedSettlementRef = Form.useWatch("settlementRef", form);

  useEffect(() => {
    const abortController = new AbortController();

    void integrationsApi
      .getNovaPoshtaIntegrations({ signal: abortController.signal })
      .then((items) => {
        if (!abortController.signal.aborted) {
          setIntegrations(items);
        }
      })
      .catch((error) => {
        if (!abortController.signal.aborted && !isCanceledRequest(error)) {
          setIntegrations([]);
          setIntegrationsFailed(true);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIntegrationsLoading(false);
        }
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const firstIntegration = integrations[0];

    if (!firstIntegration) {
      return;
    }

    const hasSelectedIntegration = integrations.some(
      (integration) => String(integration.id) === String(selectedIntegrationId),
    );

    if (hasSelectedIntegration) {
      return;
    }

    form.setFieldsValue({
      deliveryMethod: "nova_poshta",
      novaPoshtaIntegrationId: firstIntegration.id,
      ...clearCityAndLocationValues(),
    });
  }, [form, integrations, selectedIntegrationId]);

  const selectedIntegration = useMemo(
    () =>
      integrations.find(
        (integration) =>
          String(integration.id) === String(selectedIntegrationId),
      ) ?? null,
    [integrations, selectedIntegrationId],
  );

  const loadCityOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (!selectedIntegration) {
        return [];
      }

      const settlements = await integrationsApi.searchNovaPoshtaSettlements(
        {
          auth: { novaPoshtaIntegrationId: selectedIntegration.id },
          query,
        },
        { signal },
      );

      return settlementsToOptions(settlements);
    },
    [selectedIntegration],
  );

  const loadWarehouseOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (!selectedIntegration || !selectedSettlementRef) {
        return [];
      }

      const warehouses = await integrationsApi.searchNovaPoshtaWarehouses(
        {
          auth: { novaPoshtaIntegrationId: selectedIntegration.id },
          ref: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return warehousesToOptions(warehouses);
    },
    [selectedIntegration, selectedSettlementRef],
  );

  const loadStreetOptions = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (!selectedIntegration || !selectedSettlementRef) {
        return [];
      }

      const streets = await integrationsApi.searchNovaPoshtaStreets(
        {
          auth: { novaPoshtaIntegrationId: selectedIntegration.id },
          settlementRef: selectedSettlementRef,
          query,
        },
        { signal },
      );

      return streetsToOptions(streets);
    },
    [selectedIntegration, selectedSettlementRef],
  );

  const citySelect = useRemoteSelect<CityOption>({
    enabled: Boolean(selectedIntegration),
    minSearchLength: CITY_MIN_SEARCH_LENGTH,
    loadOptions: loadCityOptions,
  });
  const warehouseSelect = useRemoteSelect<WarehouseOption>({
    enabled: Boolean(
      selectedIntegration &&
      selectedSettlementRef &&
      selectedDeliveryType === "warehouse",
    ),
    minSearchLength: WAREHOUSE_MIN_SEARCH_LENGTH,
    loadOptions: loadWarehouseOptions,
  });
  const streetSelect = useRemoteSelect<StreetOption>({
    enabled: Boolean(
      selectedIntegration &&
      selectedSettlementRef &&
      selectedDeliveryType === "address",
    ),
    minSearchLength: STREET_MIN_SEARCH_LENGTH,
    loadOptions: loadStreetOptions,
  });
  const { clear: clearCitySelect, clearSearch: clearCitySearch } = citySelect;
  const { clear: clearWarehouseSelect, clearSearch: clearWarehouseSearch } =
    warehouseSelect;
  const { clear: clearStreetSelect, clearSearch: clearStreetSearch } =
    streetSelect;

  const providerOptions = useMemo(
    () =>
      integrations.map((integration) => ({
        value: integration.id,
        label:
          integration.name ||
          integration.sender_name ||
          `Nova Poshta #${integration.id}`,
      })),
    [integrations],
  );

  const clearSelects = useCallback(() => {
    clearCitySelect();
    clearWarehouseSelect();
    clearStreetSelect();
  }, [clearCitySelect, clearStreetSelect, clearWarehouseSelect]);

  const handleProviderChange = useCallback(
    (value: number) => {
      form.setFieldsValue({
        deliveryMethod: "nova_poshta",
        novaPoshtaIntegrationId: value,
        ...clearCityAndLocationValues(),
      });
      clearSelects();
    },
    [clearSelects, form],
  );

  const handleDeliveryTypeChange = useCallback(
    (value: string | number) => {
      form.setFieldsValue({
        deliveryType: value as OrderDeliveryType,
        ...clearLocationValues(),
      });
      clearWarehouseSelect();
      clearStreetSelect();
    },
    [clearStreetSelect, clearWarehouseSelect, form],
  );

  const handleCityChange = useCallback(
    (_value: string, option?: CityOption | CityOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({
        city: selectedOption.cityName,
        cityRef: selectedOption.value,
        settlementRef: selectedOption.settlementRef,
        ...clearLocationValues(),
      });
      clearCitySearch();
      clearWarehouseSelect();
      clearStreetSelect();
    },
    [clearCitySearch, clearStreetSelect, clearWarehouseSelect, form],
  );

  const handleWarehouseChange = useCallback(
    (_value: string, option?: WarehouseOption | WarehouseOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({
        warehouse: selectedOption.warehouseName,
        warehouseRef: selectedOption.value,
      });
      clearWarehouseSearch();
    },
    [clearWarehouseSearch, form],
  );

  const handleStreetChange = useCallback(
    (_value: string, option?: StreetOption | StreetOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({
        street: selectedOption.streetName,
        streetRef: selectedOption.value,
      });
      clearStreetSearch();
    },
    [clearStreetSearch, form],
  );

  return {
    cityOptions: citySelect.options,
    citySelect,
    clearSelects,
    hasProvider: Boolean(selectedIntegration),
    integrationsFailed,
    integrationsLoading,
    onCityChange: handleCityChange,
    onDeliveryTypeChange: handleDeliveryTypeChange,
    onProviderChange: handleProviderChange,
    onStreetChange: handleStreetChange,
    onWarehouseChange: handleWarehouseChange,
    providerOptions,
    selectedDeliveryType,
    selectedSettlementRef,
    streetOptions: streetSelect.options,
    streetSelect,
    warehouseOptions: warehouseSelect.options,
    warehouseSelect,
  };
}
