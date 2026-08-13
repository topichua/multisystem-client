import { Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import {
  PaneSectionHint,
  PaneSectionTitle,
} from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { useSettingsIntegrationsController } from "./controllers/use-settings-integrations-controller";
import { IntegrationTypeCard } from "./integration-type-card";
import { IntegrationTypeSidebar } from "./integration-type-sidebar";
import {
  renderIntegrationNoticeContent,
  renderIntegrationSetupContent,
} from "./integration-type-setup-content";
import { INTEGRATION_TYPES } from "./settings-integrations.definitions";
import * as S from "./settings-integrations.styled";
import { TelegramPasswordModal } from "./telegram-password-modal";
import { TelegramQrLoginModal } from "./telegram-qr-login-modal";

export const SettingsIntegrationsPage = observer(() => {
  const { t } = useTranslation();
  const controller = useSettingsIntegrationsController();
  const { store } = controller;
  const selectedDefinition = INTEGRATION_TYPES.find(
    (item) => item.type === controller.selectedFilter,
  );
  const headerTitle = selectedDefinition
    ? t(selectedDefinition.labelKey)
    : t("integrations.title");
  const headerHint = selectedDefinition
    ? t(selectedDefinition.descriptionKey)
    : t("integrations.subtitle");

  return (
    <>
      <PaneNavSplitLayout.Root data-qa="layout-settings-integrations-shell">
        <IntegrationTypeSidebar
          integrationsCountByType={{
            instagram: controller.integrationsByType.instagram.length,
            tiktok: controller.integrationsByType.tiktok.length,
            telegram: controller.integrationsByType.telegram.length,
            novaposhta: controller.integrationsByType.novaposhta.length,
            monobank: controller.integrationsByType.monobank.length,
            manualpayment: controller.integrationsByType.manualpayment.length,
          }}
          menuIntegrationTypes={controller.menuIntegrationTypes}
          query={controller.query}
          selectedFilter={controller.selectedFilter}
          totalCount={store.items.length}
          onQueryChange={controller.setQuery}
          onFilterChange={controller.setSelectedFilter}
        />

        <PaneNavSplitLayout.SubMain data-qa="layout-settings-integrations-main">
          {store.listLoading ? (
            <CenteredSpinner />
          ) : (
            <PaneDetailLayout.Root inset data-qa="layout-settings-integrations">
              <PaneDetailLayout.Header data-qa="layout-settings-integrations-detail-header">
                <PaneSectionTitle>{headerTitle}</PaneSectionTitle>
                <PaneSectionHint style={{ marginTop: 0 }}>
                  {headerHint}
                </PaneSectionHint>
              </PaneDetailLayout.Header>

              <PaneDetailLayout.Body data-qa="layout-settings-integrations-body">
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
                        noticeContent={renderIntegrationNoticeContent(
                          definition,
                          controller,
                          t,
                        )}
                        setupContent={renderIntegrationSetupContent(
                          definition,
                          controller,
                        )}
                        onConnectType={(type) =>
                          void controller.handleConnectType(type)
                        }
                        onDisconnect={controller.handleDisconnect}
                        onIntegrationUpdated={
                          controller.handleIntegrationUpdated
                        }
                      />
                    ))
                  )}
                </S.IntegrationsStack>
              </PaneDetailLayout.Body>
            </PaneDetailLayout.Root>
          )}
        </PaneNavSplitLayout.SubMain>
      </PaneNavSplitLayout.Root>

      <TelegramQrLoginModal
        open={controller.telegramQrModal.open}
        qrImageUrl={controller.telegramQrModal.session?.qrImageUrl ?? null}
        status={controller.telegramQrModal.status}
        onCancel={controller.closeTelegramQrModal}
        onRetry={controller.retryTelegramQrLogin}
      />

      <TelegramPasswordModal
        hint={controller.telegramPasswordModal.hint}
        open={controller.telegramPasswordModal.open}
        submitting={controller.telegramPasswordModal.submitting}
        onCancel={controller.closeTelegramPasswordModal}
        onSubmit={(password) => {
          void controller.submitTelegramPassword(password);
        }}
      />
    </>
  );
});
