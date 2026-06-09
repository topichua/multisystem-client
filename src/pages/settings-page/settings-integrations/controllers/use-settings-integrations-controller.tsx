import { Modal, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import {
  closeIntegrationAuthWindow,
  navigateIntegrationAuthUrl,
  openIntegrationAuthWindow,
} from "@/features/integrations/open-integration-auth";
import type { IntegrationItem } from "@/features/integrations/model/integration.types";
import { isIntegrationNotAvailableError } from "@/features/integrations/model/integrations-store";
import { useIntegrationsStore } from "@/features/integrations/model/use-integrations-store";

import {
  createEmptyIntegrationsByType,
  INTEGRATION_TYPES,
  isKnownIntegrationType,
  type IntegrationDefinition,
  type IntegrationFilter,
  type IntegrationType,
} from "../settings-integrations.definitions";

export function useSettingsIntegrationsController() {
  const store = useIntegrationsStore();
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<IntegrationFilter>("all");

  useEffect(() => {
    void store.loadIntegrations();
  }, [store]);

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
          isIntegrationNotAvailableError(e)
            ? t("integrations.notAvailableYet")
            : getApiErrorMessage(e, t("integrations.connectFailed")),
        );
      }
    },
    [messageApi, store, t],
  );

  return {
    contextHolder,
    store,
    query,
    selectedFilter,
    integrationsByType,
    menuIntegrationTypes,
    visibleIntegrationTypes,
    setQuery,
    setSelectedFilter,
    getVisibleIntegrations,
    handleDisconnect,
    handleConnectType,
  };
}
