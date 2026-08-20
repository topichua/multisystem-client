import { Alert } from "antd";
import type { ReactNode } from "react";
import type { TFunction } from "i18next";

import type { useSettingsIntegrationsController } from "./controllers/use-settings-integrations-controller";
import { InstagramIntegrationSetup } from "./instagram";
import { ManualPaymentMethodsSetup } from "./manual-payment-methods";
import { MonobankIntegrationForm } from "./monobank";
import { NovaPoshtaIntegrationWizard } from "./nova-poshta";
import type { IntegrationDefinition } from "./settings-integrations.definitions";

type IntegrationsController = ReturnType<
  typeof useSettingsIntegrationsController
>;

export const renderIntegrationNoticeContent = (
  definition: IntegrationDefinition,
  controller: IntegrationsController,
  t: TFunction,
): ReactNode => {
  if (
    definition.type !== "instagram" ||
    !controller.instagramHistorySyncNoticeVisible
  ) {
    return undefined;
  }

  return (
    <Alert
      type="info"
      showIcon
      closable={{
        onClose: controller.dismissInstagramHistorySyncNotice,
      }}
      title={t("integrations.instagramSetup.historySyncTitle")}
      description={t("integrations.instagramSetup.historySyncDescription")}
    />
  );
};

export const renderIntegrationSetupContent = (
  definition: IntegrationDefinition,
  controller: IntegrationsController,
): ReactNode => {
  const isOpen = {
    novaposhta: controller.novaPoshtaWizardOpen,
    monobank: controller.monobankFormOpen,
    manualpayment: controller.manualPaymentFormOpen,
    instagram: controller.instagramSetup.open,
    tiktok: false,
    telegram: false,
  } satisfies Record<IntegrationDefinition["type"], boolean>;

  if (!isOpen[definition.type]) {
    return undefined;
  }

  const { store } = controller;

  switch (definition.type) {
    case "novaposhta":
      return (
        <NovaPoshtaIntegrationWizard
          submitting={store.isConnecting("novaposhta")}
          onCancel={controller.closeNovaPoshtaWizard}
          onSubmit={controller.handleNovaPoshtaWizardSubmit}
        />
      );

    case "monobank":
      return (
        <MonobankIntegrationForm
          mode="connect"
          submitting={store.isConnecting("monobank")}
          onCancel={controller.closeMonobankForm}
          onSubmit={controller.handleMonobankSubmit}
        />
      );

    case "manualpayment":
      return (
        <ManualPaymentMethodsSetup
          integrations={controller.integrationsByType.manualpayment}
          onCancel={controller.closeManualPaymentForm}
          onUpdated={controller.handleIntegrationUpdated}
        />
      );

    case "instagram":
      return (
        <InstagramIntegrationSetup
          stage={controller.instagramSetup.stage}
          pages={controller.instagramSetup.pages}
          connecting={controller.instagramSetup.connecting}
          awaitingOauth={controller.instagramSetup.awaitingOauth}
          confirming={controller.instagramSetup.confirming}
          sessionExpired={controller.instagramSetup.sessionExpired}
          errorMessage={controller.instagramSetup.errorMessage}
          onContinueWithInstagram={() => {
            void controller.startInstagramAuth();
          }}
          onConfirm={(pageId) => {
            void controller.confirmInstagramPage(pageId);
          }}
          onCancel={() => {
            void controller.cancelInstagramConnectFlow();
          }}
          onRestart={controller.openInstagramSetup}
        />
      );

    default:
      return undefined;
  }
};
