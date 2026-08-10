import { useCallback, useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { characteristicsApi } from "@/features/characteristics/api/characteristics-api";
import type {
  CharacteristicLibraryInstallPayload,
  CharacteristicLibraryResponse,
} from "@/features/characteristics/model/characteristic.types";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import { buildLibraryTreeData } from "./characteristic-library-tree.utils";

export const useCharacteristicLibraryCreateButton = () => {
  const { t } = useTranslation();
  const store = useCharacteristicsStore();
  const notification = useNotification();

  const [library, setLibrary] = useState<CharacteristicLibraryResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [installingKey, setInstallingKey] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const reloadLibrary = useCallback(async () => {
    const data = await characteristicsApi.getLibrary();
    setLibrary(data);
  }, []);

  const loadLibrary = useCallback(async () => {
    if (loading) {
      return;
    }

    const shouldShowLoading = library == null;
    if (shouldShowLoading) {
      setLoading(true);
    }
    setLoadError(false);

    try {
      await reloadLibrary();
    } catch {
      setLoadError(true);
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [library, loading, reloadLibrary]);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setExpandedKeys((currentKeys) =>
      currentKeys.includes(groupKey)
        ? currentKeys.filter((key) => key !== groupKey)
        : [...currentKeys, groupKey],
    );
  }, []);

  const handleInstallField = useCallback(
    async (payload: CharacteristicLibraryInstallPayload) => {
      if (installingKey != null) {
        return;
      }

      setInstallingKey(`field:${payload.key}`);

      try {
        await store.installLibraryField(payload);
        await reloadLibrary();
        notification.success({
          title: t("characteristics.library.installFieldSuccess"),
        });
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("characteristics.library.installFailed"),
          ),
        });
      } finally {
        setInstallingKey(null);
      }
    },
    [installingKey, notification, reloadLibrary, store, t],
  );

  const handleInstallGroup = useCallback(
    async (groupKey: string) => {
      if (installingKey != null) {
        return;
      }

      setInstallingKey(`group:${groupKey}`);

      try {
        const result = await store.installLibraryGroup({ groupKey });
        await reloadLibrary();

        if (result.installed.length === 0) {
          notification.success({
            title: t("characteristics.library.installGroupAllSkipped"),
          });
        } else {
          notification.success({
            title: t("characteristics.library.installGroupSuccess", {
              count: result.installed.length,
            }),
          });
        }
      } catch (error) {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("characteristics.library.installFailed"),
          ),
        });
      } finally {
        setInstallingKey(null);
      }
    },
    [installingKey, notification, reloadLibrary, store, t],
  );

  const onInstallField = useCallback(
    (payload: CharacteristicLibraryInstallPayload) => {
      void handleInstallField(payload);
    },
    [handleInstallField],
  );

  const onInstallGroup = useCallback(
    (groupKey: string) => {
      void handleInstallGroup(groupKey);
    },
    [handleInstallGroup],
  );

  const treeData = useMemo(
    () =>
      library == null
        ? []
        : buildLibraryTreeData({
            library,
            expandedKeys,
            installingKey,
            onToggleGroup: handleToggleGroup,
            onInstallField,
            onInstallGroup,
          }),
    [
      expandedKeys,
      handleToggleGroup,
      installingKey,
      library,
      onInstallField,
      onInstallGroup,
    ],
  );

  const handleOpenChange = (open: boolean) => {
    setDropdownOpen(open);

    if (open) {
      void loadLibrary();
      return;
    }

    setExpandedKeys([]);
  };

  return {
    dropdownOpen,
    expandedKeys,
    loadError,
    loading,
    setExpandedKeys,
    treeData,
    handleOpenChange,
    t,
  };
};
