import type { MenuProps } from "antd";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Input,
  Menu,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  InstagramOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { PaneScrollRegion } from "@/components/layout/pane-frame";
import { PaneNavSplitLayout } from "@/components/layout/pane-nav-split-layout";
import {
  closeIntegrationAuthWindow,
  navigateIntegrationAuthUrl,
  openIntegrationAuthWindow,
} from "@/features/integrations/open-integration-auth";
import type { IntegrationItem } from "@/features/integrations/model/integration.types";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";

import {
  AddIntegrationModal,
  type AddIntegrationType,
} from "./settings-integrations-modal";

const INTEGRATION_TYPES = [
  {
    type: "instagram",
    labelKey: "integrations.types.instagram.label",
    descriptionKey: "integrations.types.instagram.description",
    connectLabelKey: "integrations.types.instagram.connectLabel",
    emptyKey: "integrations.types.instagram.empty",
    icon: <InstagramOutlined />,
  },
  {
    type: "telegram",
    labelKey: "integrations.types.telegram.label",
    descriptionKey: "integrations.types.telegram.description",
    connectLabelKey: "integrations.types.telegram.connectLabel",
    emptyKey: "integrations.types.telegram.empty",
    icon: <SendOutlined />,
  },
] as const;

type IntegrationType = (typeof INTEGRATION_TYPES)[number]["type"];
type IntegrationDefinition = (typeof INTEGRATION_TYPES)[number];
type IntegrationFilter = "all" | IntegrationType;

const createEmptyIntegrationsByType = (): Record<
  IntegrationType,
  IntegrationItem[]
> => ({
  instagram: [],
  telegram: [],
});

const isKnownIntegrationType = (
  type: IntegrationItem["type"],
): type is IntegrationType => type === "instagram" || type === "telegram";

export const SettingsIntegrationsPage = observer(() => {
  const store = useIntegrationsStore();
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<IntegrationFilter>("all");

  useEffect(() => {
    void store.loadIntegrations();
  }, [store]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const integrationsByType = useMemo(() => {
    return store.items.reduce<Record<IntegrationType, IntegrationItem[]>>(
      (acc, integration) => {
        if (isKnownIntegrationType(integration.type)) {
          acc[integration.type].push(integration);
        }

        return acc;
      },
      createEmptyIntegrationsByType(),
    );
  }, [store.items]);

  const menuIntegrationTypes = useMemo(() => {
    if (!normalizedQuery) {
      return INTEGRATION_TYPES;
    }

    return INTEGRATION_TYPES.filter((item) => {
      const label = t(item.labelKey);
      const typeMatches = label.toLowerCase().includes(normalizedQuery);

      const integrationMatches = integrationsByType[item.type].some(
        (integration) => {
          const haystack =
            `${integration.type} ${integration.name}`.toLowerCase();

          return haystack.includes(normalizedQuery);
        },
      );

      return typeMatches || integrationMatches;
    });
  }, [integrationsByType, normalizedQuery, t]);

  const visibleIntegrationTypes = useMemo(() => {
    if (selectedFilter === "all") {
      return menuIntegrationTypes;
    }

    return menuIntegrationTypes.filter((item) => item.type === selectedFilter);
  }, [menuIntegrationTypes, selectedFilter]);

  const getVisibleIntegrations = useCallback(
    (item: IntegrationDefinition) => {
      const integrations = integrationsByType[item.type];

      const label = t(item.labelKey);
      if (!normalizedQuery || label.toLowerCase().includes(normalizedQuery)) {
        return integrations;
      }

      return integrations.filter((integration) => {
        const haystack =
          `${integration.type} ${integration.name}`.toLowerCase();

        return haystack.includes(normalizedQuery);
      });
    },
    [integrationsByType, normalizedQuery, t],
  );

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    setSelectedFilter(key as IntegrationFilter);
  };

  const menuItems: MenuProps["items"] = useMemo(() => {
    const typeItems = menuIntegrationTypes.map((item) => ({
      key: item.type,
      icon: item.icon,
      label: (
        <Flex align="center" justify="space-between" gap={12}>
          <Typography.Text>{t(item.labelKey)}</Typography.Text>
          <Badge count={integrationsByType[item.type].length} showZero />
        </Flex>
      ),
    }));

    return [
      {
        key: "all",
        icon: <AppstoreOutlined />,
        label: (
          <Flex align="center" justify="space-between" gap={12}>
            <Typography.Text>
              {t("integrations.allIntegrations")}
            </Typography.Text>
            <Badge count={store.items.length} showZero />
          </Flex>
        ),
      },
      ...typeItems,
    ];
  }, [integrationsByType, menuIntegrationTypes, store.items.length, t]);

  const isEmpty = store.items.length === 0;

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
      <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
        {t("integrations.addIntegration")}
      </Button>
    </Flex>
  );

  const handleSelectIntegration = useCallback(
    async (type: AddIntegrationType, authWindow: Window | null) => {
      try {
        const created = await store.connectIntegration(type);

        if (created.url) {
          navigateIntegrationAuthUrl(created.url, authWindow);
          closeModal();
          return;
        }

        closeIntegrationAuthWindow(authWindow);
        messageApi.success(t("integrations.connectSuccess"));
        closeModal();
      } catch (e) {
        closeIntegrationAuthWindow(authWindow);
        messageApi.error(
          getApiErrorMessage(e, t("integrations.connectFailed")),
        );
        throw e;
      }
    },
    [closeModal, messageApi, store, t],
  );

  const handleDisconnect = useCallback(
    (integration: IntegrationItem) => {
      Modal.confirm({
        title: t("integrations.disconnectConfirmTitle"),
        content: t("integrations.disconnectConfirmContent", {
          name: integration.name,
        }),
        okText: t("integrations.disconnectConfirmOk"),
        okType: "danger",
        cancelText: t("integrations.disconnectConfirmCancel"),
        onOk: async () => {
          try {
            await store.disconnectIntegration(integration.type, integration.id);
            messageApi.success(t("integrations.disconnectSuccess"));
          } catch (e) {
            messageApi.error(
              getApiErrorMessage(e, t("integrations.disconnectFailed")),
            );
            return Promise.reject();
          }
        },
      });
    },
    [messageApi, store, t],
  );

  const handleConnectType = useCallback(
    async (type: IntegrationType) => {
      const authWindow = openIntegrationAuthWindow();

      try {
        const created = await store.connectIntegration(type);

        if (created.url) {
          navigateIntegrationAuthUrl(created.url, authWindow);
          return;
        }

        closeIntegrationAuthWindow(authWindow);
        messageApi.success(t("integrations.connectSuccess"));
      } catch (e) {
        closeIntegrationAuthWindow(authWindow);
        messageApi.error(
          getApiErrorMessage(e, t("integrations.connectFailed")),
        );
      }
    },
    [messageApi, store, t],
  );

  return (
    <>
      {contextHolder}
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
          ) : isEmpty ? (
            <Flex flex={1} align="center" justify="center">
              <Empty
                description={
                  <Typography.Text type="secondary">
                    {t("integrations.noIntegrationsYet")}
                  </Typography.Text>
                }
              >
                <Button type="primary" onClick={openModal}>
                  {t("integrations.addIntegration")}
                </Button>
              </Empty>
            </Flex>
          ) : (
            <PaneNavSplitLayout.Root data-qa="layout-settings-integrations-shell">
              <PaneNavSplitLayout.SubSidebar data-qa="layout-settings-integrations-sidebar">
                <div style={{ flexShrink: 0, marginBottom: 12 }}>
                  <Input
                    placeholder={t("integrations.searchPlaceholder")}
                    prefix={<SearchOutlined />}
                    value={query}
                    allowClear
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                <PaneScrollRegion data-qa="layout-settings-integrations-nav-scroll">
                  <Menu
                    mode="inline"
                    selectable
                    selectedKeys={[selectedFilter]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderInlineEnd: 0 }}
                  />
                </PaneScrollRegion>
              </PaneNavSplitLayout.SubSidebar>

              <PaneNavSplitLayout.SubMain data-qa="layout-settings-integrations-main">
                <PaneScrollRegion data-qa="layout-settings-integrations-content-scroll">
                  <Space
                    orientation="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    {visibleIntegrationTypes.length === 0 ? (
                      <Empty description={t("integrations.noMatchFilters")} />
                    ) : (
                      visibleIntegrationTypes.map((item) => {
                        const visibleIntegrations =
                          getVisibleIntegrations(item);

                        return (
                          <Card key={item.type}>
                            <Flex
                              align="center"
                              justify="space-between"
                              gap={16}
                            >
                              <Space size={16}>
                                <Avatar
                                  size={40}
                                  shape="square"
                                  icon={item.icon}
                                />
                                <div>
                                  <Typography.Title
                                    level={4}
                                    style={{ margin: 0 }}
                                  >
                                    {t(item.labelKey)}
                                  </Typography.Title>
                                  <Typography.Text type="secondary">
                                    {t(item.descriptionKey)}
                                  </Typography.Text>
                                </div>
                              </Space>
                              <Button
                                icon={<PlusOutlined />}
                                loading={store.connectLoading}
                                onClick={() =>
                                  void handleConnectType(item.type)
                                }
                              >
                                {t(item.connectLabelKey)}
                              </Button>
                            </Flex>

                            <Divider />

                            {visibleIntegrations.length === 0 ? (
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={t(item.emptyKey)}
                              />
                            ) : (
                              <Space
                                orientation="vertical"
                                size={8}
                                style={{ width: "100%" }}
                              >
                                {visibleIntegrations.map((integration) => (
                                  <Card
                                    key={`${integration.type}-${integration.id}-${integration.connectedAt}`}
                                    size="small"
                                  >
                                    <Flex
                                      align="center"
                                      justify="space-between"
                                      gap={16}
                                    >
                                      <Space size={12}>
                                        <Avatar icon={item.icon} />
                                        <div>
                                          <Space size={8} wrap>
                                            <Typography.Text strong>
                                              {integration.name}
                                            </Typography.Text>
                                            <Tag color="success">
                                              {t("integrations.connectedTag")}
                                            </Tag>
                                          </Space>
                                          <Flex gap={32} wrap="wrap">
                                            <Typography.Text type="secondary">
                                              {t("integrations.typeLabel", {
                                                type: integration.type,
                                              })}
                                            </Typography.Text>
                                            <Typography.Text type="secondary">
                                              {t("integrations.addedLabel", {
                                                date: integration.connectedAt,
                                              })}
                                            </Typography.Text>
                                          </Flex>
                                        </div>
                                      </Space>
                                      <Dropdown
                                        trigger={["click"]}
                                        menu={{
                                          items: [
                                            {
                                              key: "disconnect",
                                              label: t(
                                                "integrations.disconnectAction",
                                              ),
                                              danger: true,
                                              disabled: store.isDisconnecting(
                                                integration.type,
                                                integration.id,
                                              ),
                                            },
                                          ],
                                          onClick: ({ key, domEvent }) => {
                                            domEvent.stopPropagation();
                                            if (key === "disconnect") {
                                              handleDisconnect(integration);
                                            }
                                          },
                                        }}
                                      >
                                        <Button
                                          type="text"
                                          icon={<MoreOutlined />}
                                          loading={store.isDisconnecting(
                                            integration.type,
                                            integration.id,
                                          )}
                                        />
                                      </Dropdown>
                                    </Flex>
                                  </Card>
                                ))}
                              </Space>
                            )}
                          </Card>
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
        open={modalOpen}
        onCancel={closeModal}
        onSelectIntegration={handleSelectIntegration}
      />
    </>
  );
});
