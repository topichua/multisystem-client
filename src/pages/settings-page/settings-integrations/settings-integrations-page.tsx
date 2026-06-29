import { Empty, Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  PaneScrollRegion,
  PaneSectionHint,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";

import { useSettingsIntegrationsController } from "./controllers/use-settings-integrations-controller";
import { IntegrationTypeCard } from "./integration-type-card";
import { NovaPoshtaIntegrationWizard } from "./nova-poshta";
import { IntegrationTypeSidebar } from "./integration-type-sidebar";
import * as S from "./settings-integrations.styled";
import { TelegramQrLoginModal } from "./telegram-qr-login-modal";

export const SettingsIntegrationsPage = observer(() => {
  const { t } = useTranslation();
  const controller = useSettingsIntegrationsController();
  const { store } = controller;

  return (
    <>
      <PaneDetailLayout.Root inset data-qa="layout-settings-integrations">
        <PaneDetailLayout.Header data-qa="layout-settings-integrations-header">
          <PaneSectionTitle>{t("integrations.title")}</PaneSectionTitle>
          <PaneSectionHint style={{ marginTop: 0 }}>
            {t("integrations.subtitle")}
          </PaneSectionHint>
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body
          data-qa="layout-settings-integrations-body"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            paddingTop: 0,
          }}
        >
          {store.listLoading ? (
            <Flex flex={1} align="center" justify="center">
              <Spin />
            </Flex>
          ) : (
            <PaneNavSplitLayout.Root data-qa="layout-settings-integrations-shell">
              <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-integrations-sidebar">
                <IntegrationTypeSidebar
                  integrationsCountByType={{
                    instagram: controller.integrationsByType.instagram.length,
                    telegram: controller.integrationsByType.telegram.length,
                    novaposhta: controller.integrationsByType.novaposhta.length,
                  }}
                  menuIntegrationTypes={controller.menuIntegrationTypes}
                  query={controller.query}
                  selectedFilter={controller.selectedFilter}
                  totalCount={store.items.length}
                  onQueryChange={controller.setQuery}
                  onFilterChange={controller.setSelectedFilter}
                />
              </PaneNavSplitLayout.SubSidebar>

              <PaneNavSplitLayout.SubMain data-qa="layout-settings-integrations-main">
                <PaneScrollRegion data-qa="layout-settings-integrations-content-scroll">
                  <S.IntegrationsStack>
                    {controller.visibleIntegrationTypes.length === 0 ? (
                      <Empty description={t("integrations.noMatchFilters")} />
                    ) : (
                      controller.visibleIntegrationTypes.map((definition) => (
                        <IntegrationTypeCard
                          key={definition.type}
                          connectLoading={store.isConnecting(definition.type)}
                          definition={definition}
                          integrations={controller.getVisibleIntegrations(
                            definition,
                          )}
                          isDisconnecting={(type, id) =>
                            store.isDisconnecting(type, id)
                          }
                          setupContent={
                            definition.type === "novaposhta" &&
                            controller.novaPoshtaWizardOpen ? (
                              <NovaPoshtaIntegrationWizard
                                submitting={store.isConnecting("novaposhta")}
                                onCancel={controller.closeNovaPoshtaWizard}
                                onSubmit={
                                  controller.handleNovaPoshtaWizardSubmit
                                }
                              />
                            ) : undefined
                          }
                          onConnectType={(type) =>
                            void controller.handleConnectType(type)
                          }
                          onDisconnect={controller.handleDisconnect}
                        />
                      ))
                    )}
                  </S.IntegrationsStack>
                </PaneScrollRegion>
              </PaneNavSplitLayout.SubMain>
            </PaneNavSplitLayout.Root>
          )}
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <TelegramQrLoginModal
        open={controller.telegramQrModal.open}
        qrImageUrl={controller.telegramQrModal.session?.qrImageUrl ?? null}
        status={controller.telegramQrModal.status}
        onCancel={controller.closeTelegramQrModal}
        onRetry={controller.retryTelegramQrLogin}
      />
    </>
  );
});
