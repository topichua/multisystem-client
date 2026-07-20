import { InfoIcon } from "@phosphor-icons/react";
import { Alert, Form, Steps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import * as S from "../settings-integrations.styled";
import { ApiKeyStep } from "./components/api-key-step";
import { HiddenFields } from "./components/hidden-fields";
import { PaymentStep } from "./components/payment-step";
import { SenderSectionFields } from "./components/sender-section-fields";
import { WizardFooter } from "./components/wizard-footer";
import type {
  NovaPoshtaIntegrationWizardProps,
  NovaPoshtaWizardFormValues,
} from "./types";
import { useNovaPoshtaWizard } from "./use-nova-poshta-wizard";

export function NovaPoshtaIntegrationWizard({
  submitting,
  onCancel,
  onSubmit,
}: NovaPoshtaIntegrationWizardProps) {
  const { t } = useTranslation();
  const controller = useNovaPoshtaWizard({ onSubmit });
  const stepItems = useMemo(
    () => [
      { title: t("integrations.novaPoshtaWizard.steps.apiKey") },
      { title: t("integrations.novaPoshtaWizard.steps.sender") },
      { title: t("integrations.novaPoshtaWizard.steps.payment") },
    ],
    [t],
  );

  return (
    <S.NovaPoshtaWizard>
      <S.NovaPoshtaWizardSteps>
        <Steps
          current={controller.currentStep}
          items={stepItems}
          size="small"
        />
        {controller.currentStep === 1 && (
          <S.NovaPoshtaWizardStepNote>
            <InfoIcon size={14} />
            <span>{t("integrations.novaPoshtaWizard.senderStepNote")}</span>
          </S.NovaPoshtaWizardStepNote>
        )}
      </S.NovaPoshtaWizardSteps>

      {controller.formError && (
        <Alert
          type="error"
          showIcon
          message={controller.formError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form<NovaPoshtaWizardFormValues>
        form={controller.form}
        layout="vertical"
        requiredMark
        initialValues={{
          sender_type: "warehouse",
          payer_type: "sender",
        }}
      >
        <HiddenFields />

        {controller.currentStep === 0 && <ApiKeyStep />}

        {controller.currentStep === 1 && (
          <SenderSectionFields
            citySelect={controller.citySelect}
            selectedCityRef={controller.selectedCityRef}
            selectedSenderType={controller.selectedSenderType}
            selectedSettlementRef={controller.selectedSettlementRef}
            senderOptions={controller.senderOptions}
            streetSelect={controller.streetSelect}
            warehouseSelect={controller.warehouseSelect}
            onCityChange={controller.handleCityChange}
            onSenderTypeChange={controller.handleSenderTypeChange}
            onStreetChange={controller.handleStreetChange}
            onWarehouseChange={controller.handleWarehouseChange}
          />
        )}

        {controller.currentStep === 2 && <PaymentStep />}
      </Form>

      <WizardFooter
        currentStep={controller.currentStep}
        discoverLoading={controller.discoverLoading}
        submitting={submitting}
        onBack={controller.handleBack}
        onCancel={onCancel}
        onPrimaryAction={controller.handlePrimaryAction}
      />
    </S.NovaPoshtaWizard>
  );
}
