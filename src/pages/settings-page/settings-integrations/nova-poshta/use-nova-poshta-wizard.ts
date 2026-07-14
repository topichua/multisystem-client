import { Form } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type {
  NovaPoshtaIntegrationCreatePayload,
  NovaPoshtaSenderType,
} from "@/features/integrations/model/integration.types";

import {
  firstOption,
  getClearCityAndLocationFieldsValues,
  getClearLocationFieldsValues,
} from "./helpers";
import { sendersToOptions } from "./options";
import { buildNovaPoshtaPayload } from "./payload";
import type {
  CityOption,
  NovaPoshtaWizardFormValues,
  SenderOption,
  StreetOption,
  WarehouseOption,
} from "./types";
import { useNovaPoshtaSelects } from "./use-nova-poshta-selects";

type UseNovaPoshtaWizardParams = {
  onSubmit: (payload: NovaPoshtaIntegrationCreatePayload) => Promise<void>;
};

export function useNovaPoshtaWizard({ onSubmit }: UseNovaPoshtaWizardParams) {
  const { t } = useTranslation();
  const [form] = Form.useForm<NovaPoshtaWizardFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const discoveredApiKeyRef = useRef<string | null>(null);
  const selectedSenderType = Form.useWatch("sender_type", form) ?? "warehouse";
  const selectedCityRef = Form.useWatch("sender_city_ref", form);
  const selectedSettlementRef = Form.useWatch("sender_settlement_ref", form);

  const senderOptionsByRef = useMemo(
    () => new Map(senderOptions.map((option) => [option.value, option])),
    [senderOptions],
  );
  const { citySelect, streetSelect, warehouseSelect } = useNovaPoshtaSelects({
    currentStep,
    form,
    selectedSenderType,
    selectedSettlementRef,
  });

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

      form.setFieldsValue({
        warehouse_name: selectedOption.warehouseName,
      });
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

      form.setFieldsValue({
        sender_street_name: selectedOption.streetName,
      });
      streetSelect.clearSearch();
    },
    [form, streetSelect],
  );

  const handleSenderTypeChange = useCallback(
    (value: string | number) => {
      const senderType = value as NovaPoshtaSenderType;
      form.setFieldsValue({
        sender_type: senderType,
        ...getClearLocationFieldsValues(),
      });
      warehouseSelect.clear();
      streetSelect.clear();
    },
    [form, streetSelect, warehouseSelect],
  );

  const discoverSenders = useCallback(async () => {
    setFormError(null);

    const values = await form.validateFields(["name", "apiKey"]);
    const apiKey = values.apiKey?.trim() ?? "";

    if (discoveredApiKeyRef.current === apiKey && senderOptions.length > 0) {
      setCurrentStep(1);
      return;
    }

    setDiscoverLoading(true);

    try {
      const senders = await integrationsApi.discoverNovaPoshtaSenders({
        auth: { apiKey },
      });
      const options = sendersToOptions(senders);
      const firstSender = options[0];

      if (!firstSender) {
        setFormError(t("integrations.novaPoshtaWizard.noSenders"));
        return;
      }

      setSenderOptions(options);
      discoveredApiKeyRef.current = apiKey;
      form.setFieldsValue({
        sender_contact_ref: firstSender.senderContactRef,
        ...getClearCityAndLocationFieldsValues(),
      });
      citySelect.clear();
      warehouseSelect.clear();
      streetSelect.clear();
      setCurrentStep(1);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          t("integrations.novaPoshtaWizard.discoverFailed"),
        ),
      );
    } finally {
      setDiscoverLoading(false);
    }
  }, [
    citySelect,
    form,
    senderOptions.length,
    streetSelect,
    t,
    warehouseSelect,
  ]);

  const goToPaymentStep = useCallback(async () => {
    setFormError(null);

    const fields: (keyof NovaPoshtaWizardFormValues)[] = [
      "sender_contact_ref",
      "sender_city_ref",
    ];

    if (selectedSenderType === "warehouse") {
      fields.push("warehouse_ref");
    } else {
      fields.push("sender_street_ref", "sender_building");
    }

    await form.validateFields(fields);
    setCurrentStep(2);
  }, [form, selectedSenderType]);

  const handleBack = useCallback(() => {
    setFormError(null);
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const handleFinish = useCallback(async () => {
    setFormError(null);
    await form.validateFields();
    await onSubmit(
      buildNovaPoshtaPayload(form.getFieldsValue(true), senderOptionsByRef),
    );
  }, [form, onSubmit, senderOptionsByRef]);

  const handlePrimaryAction = useCallback(async () => {
    try {
      if (currentStep === 0) {
        await discoverSenders();
        return;
      }

      if (currentStep === 1) {
        await goToPaymentStep();
        return;
      }

      await handleFinish();
    } catch {
      // Validation errors are rendered by Ant Design Form.
    }
  }, [currentStep, discoverSenders, goToPaymentStep, handleFinish]);

  return {
    citySelect,
    currentStep,
    discoverLoading,
    form,
    formError,
    handleBack,
    handleCityChange,
    handlePrimaryAction,
    handleSenderTypeChange,
    handleStreetChange,
    handleWarehouseChange,
    selectedCityRef,
    selectedSenderType,
    selectedSettlementRef,
    senderOptions,
    streetSelect,
    warehouseSelect,
  };
}
