import { PlusIcon } from "@phosphor-icons/react";
import { Button, Empty, Flex, Space, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneScrollRegion } from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";

import { AddIntegrationModal } from "./settings-integrations-modal";
import { useSettingsIntegrationsController } from "./controllers/use-settings-integrations-controller";
import { IntegrationTypeCard } from "./integration-type-card";
import { IntegrationTypeSidebar } from "./integration-type-sidebar";

export const SettingsIntegrationsPage = observer(() => {
  const { t } = useTranslation();
  const controller = useSettingsIntegrationsController();
  const { store } = controller;

  const pageHeader = (
    <Flex align="flex-start" justify="space-between" gap={16} wrap="wrap">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("integrations.title")}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t("integrations.subtitle")}
        </Typography.Text>
      </div>
      <Button type="primary" icon={<PlusIcon />} onClick={controller.openModal}>
        {t("integrations.addIntegration")}
      </Button>
    </Flex>
  );

  return (
    <>
      {controller.contextHolder}
      <PaneDetailLayout.Root inset data-qa="layout-settings-integrations">
        <PaneDetailLayout.Header data-qa="layout-settings-integrations-header">
          {pageHeader}
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
          ) : controller.isEmpty ? (
            <Flex flex={1} align="center" justify="center">
              <Empty
                description={
                  <Typography.Text type="secondary">
                    {t("integrations.noIntegrationsYet")}
                  </Typography.Text>
                }
              >
                <Button type="primary" onClick={controller.openModal}>
                  {t("integrations.addIntegration")}
                </Button>
              </Empty>
            </Flex>
          ) : (
            <PaneNavSplitLayout.Root data-qa="layout-settings-integrations-shell">
              <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-integrations-sidebar">
                <IntegrationTypeSidebar
                  integrationsCountByType={{
                    instagram: controller.integrationsByType.instagram.length,
                    telegram: controller.integrationsByType.telegram.length,
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
                  <Space
                    orientation="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    {controller.visibleIntegrationTypes.length === 0 ? (
                      <Empty description={t("integrations.noMatchFilters")} />
                    ) : (
                      controller.visibleIntegrationTypes.map((item) => {
                        const visibleIntegrations =
                          controller.getVisibleIntegrations(item);

                        return (
                          <IntegrationTypeCard
                            key={item.type}
                            connectLoading={store.connectLoading}
                            definition={item}
                            integrations={visibleIntegrations}
                            isDisconnecting={(type, id) =>
                              store.isDisconnecting(type, id)
                            }
                            onConnectType={(type) =>
                              void controller.handleConnectType(type)
                            }
                            onDisconnect={controller.handleDisconnect}
                          />
                        );
                      })
                    )}
                  </Space>
                </PaneScrollRegion>
              </PaneNavSplitLayout.SubMain>
            </PaneNavSplitLayout.Root>
          )}
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>

      <AddIntegrationModal
        open={controller.modalOpen}
        onCancel={controller.closeModal}
        onSelectIntegration={controller.handleSelectIntegration}
      />
    </>
  );
});
